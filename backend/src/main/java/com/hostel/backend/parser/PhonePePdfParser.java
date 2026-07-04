package com.hostel.backend.parser;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
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

@Slf4j
@Component
public class PhonePePdfParser implements BankStatementParser {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @Override
    public String getSupportedBank() {
        return "PHONEPE";
    }

    @Override
    public boolean canParse(MultipartFile file) {
        // Can be matched manually in factory
        return false;
    }

    @Override
    public String extractAccountNumber(MultipartFile file) throws Exception {
        return "PHONEPE";
    }

    @Override
    public List<ParsedTransaction> parseAll(MultipartFile file) throws Exception {
        List<ParsedTransaction> transactions = new ArrayList<>();
        String text = extractTextFromPdf(file);
        
        String[] lines = text.split("\\r?\\n");
        
        ParsedTransaction currentTxn = null;
        Pattern datePattern = Pattern.compile("([A-Z][a-z]{2} \\d{2}, \\d{4})"); // e.g. Jul 04, 2026
        Pattern amountPattern = Pattern.compile("₹([0-9,]+(?:\\.[0-9]+)?)");

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            
            // Check for new transaction block
            Matcher dateMatcher = datePattern.matcher(line);
            if (dateMatcher.find()) {
                if (currentTxn != null && currentTxn.getAmount() != null) {
                    transactions.add(currentTxn);
                }
                currentTxn = new ParsedTransaction();
                currentTxn.setBankName("PhonePe");
                currentTxn.setTransactionDate(LocalDate.parse(dateMatcher.group(1), DATE_FORMATTER));
                continue;
            }

            if (currentTxn != null) {
                if (line.startsWith("CREDIT") || line.startsWith("DEBIT")) {
                    String type = line.startsWith("CREDIT") ? "CREDIT" : "DEBIT";
                    currentTxn.setTransactionType(type);
                    
                    Matcher m = amountPattern.matcher(line);
                    if (m.find()) {
                        String amtStr = m.group(1).replace(",", "");
                        BigDecimal amt = new BigDecimal(amtStr);
                        currentTxn.setAmount(amt);
                        if ("CREDIT".equals(type)) {
                            currentTxn.setCredit(amt);
                        } else {
                            currentTxn.setDebit(amt);
                        }
                        
                        int endIdx = m.end();
                        if (line.length() > endIdx) {
                            currentTxn.setDescription(line.substring(endIdx).trim());
                        }
                    }
                } else if (line.startsWith("Received from ") || line.startsWith("Paid to ")) {
                    if (currentTxn.getDescription() == null) {
                        currentTxn.setDescription(line);
                    }
                } else if (line.startsWith("UTR No. ")) {
                    currentTxn.setUtrNumber(line.substring("UTR No. ".length()).trim());
                } else if (line.startsWith("Transaction ID ")) {
                    currentTxn.setReferenceNumber(line.substring("Transaction ID ".length()).trim());
                }
            }
        }
        
        if (currentTxn != null && currentTxn.getAmount() != null) {
            transactions.add(currentTxn);
        }

        return transactions;
    }

    private String extractTextFromPdf(MultipartFile file) throws Exception {
        try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
}
