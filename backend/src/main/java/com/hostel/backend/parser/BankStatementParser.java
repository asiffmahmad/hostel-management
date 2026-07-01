package com.hostel.backend.parser;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Strategy interface for parsing bank statements.
 *
 * <p>Implementations must extract transaction rows from bank-specific file formats.
 * Future banks (HDFC, ICICI, SBI …) need only a new implementation of this interface.</p>
 *
 * <p>Only CREDIT transactions should be returned by the parser; debit filtering
 * is the parser's responsibility to keep business logic clean.</p>
 *
 * Example hierarchy:
 * <pre>
 *   BankStatementParser
 *     └── AxisBankXlsParser   (Axis Bank .xls)
 *     └── HDFCBankCsvParser   (HDFC .csv)
 *     └── ICICIBankXlsParser  (ICICI .xls)
 * </pre>
 */
public interface BankStatementParser {

    /**
     * Returns the bank name this parser handles (e.g. "AXIS BANK").
     * Used by BankParserFactory for selection.
     */
    String getSupportedBank();

    /**
     * Returns true if this parser can handle the given file.
     * Implementations may inspect filename, extension, or MIME type.
     */
    boolean canParse(MultipartFile file);

    /**
     * Extracts the account number from the statement header.
     * Returns null if not determinable.
     */
    String extractAccountNumber(MultipartFile file) throws Exception;

    /**
     * Parses the entire statement and returns ALL transactions (CREDIT + DEBIT).
     * The service layer will filter as needed.
     */
    List<ParsedTransaction> parseAll(MultipartFile file) throws Exception;

    /**
     * Parses the statement and returns only CREDIT transactions.
     * Default implementation filters parseAll() result.
     */
    default List<ParsedTransaction> parseCreditOnly(MultipartFile file) throws Exception {
        return parseAll(file).stream()
                .filter(t -> "CREDIT".equalsIgnoreCase(t.getTransactionType()))
                .toList();
    }
}
