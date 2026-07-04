package com.hostel.backend;

import com.hostel.backend.parser.GPayPdfParser;
import com.hostel.backend.parser.PhonePePdfParser;
import com.hostel.backend.parser.ParsedTransaction;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.Files;
import java.util.List;

public class TestParsers {
    public static void main(String[] args) throws Exception {
        System.out.println("===========================================");
        System.out.println("Starting Parsers Test...");
        System.out.println("===========================================\n");

        File gpayFile = new File("/Users/asiff/Documents/projects/hostel-management/gpay_statement_20260601_20260630.pdf");
        File phonepeFile = new File("/Users/asiff/Documents/projects/hostel-management/PhonePe_Statement_Jun2026_Jul2026.pdf");

        GPayPdfParser gpayParser = new GPayPdfParser();
        System.out.println("--- Testing GPay Parser ---");
        List<ParsedTransaction> gpayTxns = gpayParser.parseAll(createMultipartFile(gpayFile));
        long gpayCredits = gpayTxns.stream().filter(t -> "CREDIT".equals(t.getTransactionType())).count();
        System.out.println("Total Rows Extracted: " + gpayTxns.size());
        System.out.println("Total Credits Extracted: " + gpayCredits);
        
        System.out.println("\nExtracted GPay Credits:");
        gpayTxns.stream()
            .filter(t -> "CREDIT".equals(t.getTransactionType()))
            .forEach(t -> System.out.println("  -> Date: " + t.getTransactionDate() + " | Amount: Rs." + t.getAmount() + " | UTR: " + t.getUtrNumber() + " | Desc: " + t.getDescription()));


        PhonePePdfParser phonePeParser = new PhonePePdfParser();
        System.out.println("\n\n--- Testing PhonePe Parser ---");
        List<ParsedTransaction> ppTxns = phonePeParser.parseAll(createMultipartFile(phonepeFile));
        long ppCredits = ppTxns.stream().filter(t -> "CREDIT".equals(t.getTransactionType())).count();
        System.out.println("Total Rows Extracted: " + ppTxns.size());
        System.out.println("Total Credits Extracted: " + ppCredits);
        
        System.out.println("\nExtracted PhonePe Credits:");
        ppTxns.stream()
            .filter(t -> "CREDIT".equals(t.getTransactionType()))
            .forEach(t -> System.out.println("  -> Date: " + t.getTransactionDate() + " | Amount: Rs." + t.getAmount() + " | UTR: " + t.getUtrNumber() + " | Desc: " + t.getDescription()));
            
        System.out.println("\n===========================================");
        System.out.println("Test Complete!");
        System.out.println("===========================================");
    }

    private static MultipartFile createMultipartFile(File file) throws IOException {
        byte[] content = Files.readAllBytes(file.toPath());
        return new MultipartFile() {
            @Override public String getName() { return file.getName(); }
            @Override public String getOriginalFilename() { return file.getName(); }
            @Override public String getContentType() { return "application/pdf"; }
            @Override public boolean isEmpty() { return content.length == 0; }
            @Override public long getSize() { return content.length; }
            @Override public byte[] getBytes() throws IOException { return content; }
            @Override public InputStream getInputStream() throws IOException { return new ByteArrayInputStream(content); }
            @Override public void transferTo(File dest) throws IOException, IllegalStateException { }
        };
    }
}
