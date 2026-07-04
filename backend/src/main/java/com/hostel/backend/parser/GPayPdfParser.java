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
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class GPayPdfParser implements BankStatementParser {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM, yyyy");

    @Override
    public String getSupportedBank() {
        return "GPAY";
    }

    @Override
    public boolean canParse(MultipartFile file) {
        return false;
    }

    @Override
    public String extractAccountNumber(MultipartFile file) throws Exception {
        return "GPAY";
    }

    @Override
    public List<ParsedTransaction> parseAll(MultipartFile file) throws Exception {
        List<ParsedTransaction> transactions = new ArrayList<>();
        String text = extractTextFromPdf(file);
        
        String[] lines = text.split("\\r?\\n");
        
        ParsedTransaction currentTxn = null;
        Pattern datePattern = Pattern.compile("(\\d{2} [A-Za-z]{3}, \\d{4})"); // e.g. 01 Jun, 2026
        Pattern utrPattern = Pattern.compile("UPI Transaction ID:\\s*([0-9]+)");
        Pattern amountPattern = Pattern.compile("₹([0-9,]+(?:\\.[0-9]+)?)");

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            
            // Check for date (new transaction)
            Matcher dateMatcher = datePattern.matcher(line);
            if (dateMatcher.find()) {
                if (currentTxn != null && currentTxn.getAmount() != null) {
                    transactions.add(currentTxn);
                }
                currentTxn = new ParsedTransaction();
                currentTxn.setBankName("GPay");
                try {
                    currentTxn.setTransactionDate(LocalDate.parse(dateMatcher.group(1), DATE_FORMATTER));
                } catch (DateTimeParseException e) {
                    log.warn("Failed to parse date: {}", dateMatcher.group(1));
                }
                continue;
            }

            if (currentTxn != null) {
                // Description line usually starts with "Paid to " or "Received from "
                if (line.startsWith("Paid to ")) {
                    currentTxn.setTransactionType("DEBIT");
                    currentTxn.setDescription(line);
                } else if (line.startsWith("Received from ") || line.startsWith("Received in ")) {
                    currentTxn.setTransactionType("CREDIT");
                    currentTxn.setDescription(line);
                }
                
                Matcher utrMatcher = utrPattern.matcher(line);
                if (utrMatcher.find()) {
                    currentTxn.setUtrNumber(utrMatcher.group(1));
                    currentTxn.setReferenceNumber(utrMatcher.group(1));
                }

                if (line.startsWith("₹")) {
                    Matcher amtMatcher = amountPattern.matcher(line);
                    if (amtMatcher.find()) {
                        String amtStr = amtMatcher.group(1).replace(",", "");
                        BigDecimal amt = new BigDecimal(amtStr);
                        currentTxn.setAmount(amt);
                        if ("CREDIT".equalsIgnoreCase(currentTxn.getTransactionType())) {
                            currentTxn.setCredit(amt);
                        } else {
                            currentTxn.setDebit(amt);
                        }
                    }
                }
            }
        }
        
        if (currentTxn != null && currentTxn.getAmount() != null) {
            transactions.add(currentTxn);
        }

        // Failsafe for if Credit/Debit is not properly assigned (often GPay doesn't have Receivedfrom on same line).
        // If we missed transaction type but have an amount, try guessing or just default to CREDIT if positive.
        // For now, if type is null but we are importing, we assume DEBIT unless we saw "Received".
        // Actually, we can refine this. 
        for (ParsedTransaction t : transactions) {
            if (t.getTransactionType() == null) {
                if (t.getDescription() != null && t.getDescription().contains("Received")) {
                    t.setTransactionType("CREDIT");
                    t.setCredit(t.getAmount());
                } else {
                    t.setTransactionType("DEBIT");
                    t.setDebit(t.getAmount());
                }
            }
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
