package com.hostel.backend.parser;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Factory that selects the correct {@link BankStatementParser} for a given file.
 *
 * <p>All parsers are injected via Spring and tried in order. The first parser
 * that returns {@code true} from {@code canParse()} is used.</p>
 *
 * <p>To add support for a new bank, simply create a new Spring {@code @Component}
 * that implements {@link BankStatementParser} — no changes needed here.</p>
 */
@Component
@RequiredArgsConstructor
public class BankParserFactory {

    private final List<BankStatementParser> parsers;

    /**
     * Selects and returns the appropriate parser for the uploaded file.
     *
     * @param file the uploaded bank statement
     * @return matching parser
     * @throws IllegalArgumentException if no parser supports this file format
     */
    public BankStatementParser getParser(MultipartFile file) {
        return parsers.stream()
                .filter(p -> p.canParse(file))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No parser found for file: " + file.getOriginalFilename() +
                        ". Supported formats: XLS (Axis Bank)"));
    }

    /**
     * Selects parser by bank name (case-insensitive).
     */
    public BankStatementParser getParserByBank(String bankName) {
        return parsers.stream()
                .filter(p -> p.getSupportedBank().equalsIgnoreCase(bankName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No parser found for bank: " + bankName));
    }
}
