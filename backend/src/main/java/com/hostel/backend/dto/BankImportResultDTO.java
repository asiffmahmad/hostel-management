package com.hostel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Summary returned after a bank statement import operation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankImportResultDTO {
    private String month;
    private String year;
    private String bankName;
    private String accountNumber;
    private String sourceFile;

    private int totalRowsRead;
    private int creditsImported;
    private int debitsSkipped;
    private int duplicatesSkipped;
    private int errors;
    private String message;
}
