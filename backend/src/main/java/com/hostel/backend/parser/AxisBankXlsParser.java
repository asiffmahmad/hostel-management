package com.hostel.backend.parser;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parser for Axis Bank XLS account statements.
 *
 * <h3>File Format</h3>
 * <pre>
 * Row 0–14 : Header metadata (Name, Account No, Period, etc.)
 * Row 15   : Blank
 * Row 16   : Column headers:  SRL NO | Tran Date | CHQNO | PARTICULARS | DR | CR | BAL | SOL
 * Row 17+  : Transaction rows (blank CR = Debit, blank DR = Credit)
 * Footer   : Disclaimers and legend (auto-ignored once numeric SRL NO absent)
 * </pre>
 *
 * <h3>UTR Extraction</h3>
 * For UPI/IMPS transactions the reference number is embedded in PARTICULARS:
 * <ul>
 *   <li>UPI  : {@code UPI/P2A/414449976653/...}  → UTR = {@code 414449976653}</li>
 *   <li>IMPS : {@code IMPS/P2A/618213397873/...} → UTR = {@code 618213397873}</li>
 * </ul>
 */
@Slf4j
@Component
public class AxisBankXlsParser implements BankStatementParser {

    private static final String BANK_NAME = "AXIS BANK";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    // Matches UPI/P2A/123456789/... or IMPS/P2A/123456789/...
    private static final Pattern UTR_PATTERN =
            Pattern.compile("(?:UPI|IMPS|NEFT|RTGS)/[^/]+/([0-9A-Za-z]+)", Pattern.CASE_INSENSITIVE);

    // Matches "Account No - 922010004760263" in the header
    private static final Pattern ACCOUNT_PATTERN =
            Pattern.compile("Account No\\s*[–-]\\s*([0-9]+)", Pattern.CASE_INSENSITIVE);

    @Override
    public String getSupportedBank() {
        return BANK_NAME;
    }

    @Override
    public boolean canParse(MultipartFile file) {
        String name = file.getOriginalFilename();
        return name != null && (name.toLowerCase().endsWith(".xls") || name.toLowerCase().endsWith(".xlsx"));
    }

    @Override
    public String extractAccountNumber(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream();
             Workbook wb = new HSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);
            for (int i = 0; i <= 20; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String cell = getCellString(row.getCell(0));
                Matcher m = ACCOUNT_PATTERN.matcher(cell);
                if (m.find()) return m.group(1);
            }
        }
        return null;
    }

    @Override
    public List<ParsedTransaction> parseAll(MultipartFile file) throws Exception {
        List<ParsedTransaction> results = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook wb = new HSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);

            // Find the header row (contains "Tran Date")
            int dataStartRow = findDataStartRow(sheet);
            if (dataStartRow < 0) {
                log.warn("Axis Bank parser: could not find header row in statement");
                return results;
            }

            String accountNumber = extractAccountNumber(file);

            for (int i = dataStartRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // SRL NO column (index 0) must contain a numeric value
                Cell srlCell = row.getCell(0);
                if (!isNumericCell(srlCell)) continue; // footer / blank row

                try {
                    ParsedTransaction txn = parseRow(row, accountNumber);
                    if (txn != null) results.add(txn);
                } catch (Exception e) {
                    log.warn("Axis Bank parser: skipping row {} due to error: {}", i, e.getMessage());
                }
            }
        }

        log.info("Axis Bank parser: extracted {} transactions from {}", results.size(), file.getOriginalFilename());
        return results;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private int findDataStartRow(Sheet sheet) {
        for (int i = 0; i <= 25; i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            String cell = getCellString(row.getCell(1));
            if (cell.toLowerCase().contains("tran date")) {
                return i + 1; // data starts on the next row
            }
        }
        return -1;
    }

    /**
     * Parses a single data row.
     * Columns: 0=SRL, 1=TranDate, 2=CHQNO, 3=PARTICULARS, 4=DR, 5=CR, 6=BAL, 7=SOL
     */
    private ParsedTransaction parseRow(Row row, String accountNumber) {
        String dateStr   = getCellString(row.getCell(1)).trim();
        String chqno     = getCellString(row.getCell(2)).trim();
        String desc      = getCellString(row.getCell(3)).trim();
        String drStr     = getCellString(row.getCell(4)).trim();
        String crStr     = getCellString(row.getCell(5)).trim();
        String balStr    = getCellString(row.getCell(6)).trim();

        if (dateStr.isEmpty()) return null;

        LocalDate txnDate = LocalDate.parse(dateStr, DATE_FMT);

        BigDecimal dr  = parseMoney(drStr);
        BigDecimal cr  = parseMoney(crStr);
        BigDecimal bal = parseMoney(balStr);

        // Determine direction
        boolean isCredit = cr != null && cr.compareTo(BigDecimal.ZERO) > 0;
        boolean isDebit  = dr != null && dr.compareTo(BigDecimal.ZERO) > 0;

        String txnType = isCredit ? "CREDIT" : "DEBIT";
        BigDecimal amount = isCredit ? cr : (dr != null ? dr : BigDecimal.ZERO);

        // Extract UTR from PARTICULARS
        String utr = extractUtr(desc);
        // Fallback: use CHQNO as reference
        String reference = chqno.isEmpty() ? null : chqno;

        return ParsedTransaction.builder()
                .bankName(BANK_NAME)
                .accountNumber(accountNumber)
                .transactionDate(txnDate)
                .valueDate(txnDate)
                .description(desc)
                .utrNumber(utr)
                .amount(amount)
                .transactionType(txnType)
                .credit(isCredit ? cr : null)
                .debit(isDebit ? dr : null)
                .balance(bal)
                .referenceNumber(reference)
                .build();
    }

    /** Extracts the UTR/reference number embedded in PARTICULARS text. */
    private String extractUtr(String particulars) {
        if (particulars == null || particulars.isBlank()) return null;
        Matcher m = UTR_PATTERN.matcher(particulars);
        if (m.find()) return m.group(1);
        return null;
    }

    private BigDecimal parseMoney(String val) {
        if (val == null || val.isBlank() || val.equals(" ")) return null;
        try {
            String cleaned = val.replaceAll("[^0-9.]", "");
            if (cleaned.isEmpty()) return null;
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toLocalDate().format(DATE_FMT);
                }
                yield String.valueOf(cell.getNumericCellValue());
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCachedFormulaResultType() == CellType.STRING
                    ? cell.getStringCellValue()
                    : String.valueOf(cell.getNumericCellValue());
            default -> "";
        };
    }

    private boolean isNumericCell(Cell cell) {
        if (cell == null) return false;
        if (cell.getCellType() == CellType.NUMERIC) return true;
        if (cell.getCellType() == CellType.STRING) {
            try {
                Double.parseDouble(cell.getStringCellValue().trim());
                return true;
            } catch (NumberFormatException e) {
                return false;
            }
        }
        return false;
    }
}
