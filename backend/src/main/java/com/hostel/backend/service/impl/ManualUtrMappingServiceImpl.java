package com.hostel.backend.service.impl;

import com.hostel.backend.dto.ManualUtrMappingResultDTO;
import com.hostel.backend.dto.ManualUtrMappingRowDTO;
import com.hostel.backend.entity.BankTransaction;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import com.hostel.backend.repository.BankTransactionRepository;
import com.hostel.backend.repository.PaymentRepository;
import com.hostel.backend.repository.StudentRepository;
import com.hostel.backend.service.ManualUtrMappingService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ManualUtrMappingServiceImpl implements ManualUtrMappingService {

    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final BankTransactionRepository bankTransactionRepository;

    @Override
    public byte[] generateMappingTemplate(Long hostelId, String month, String year) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Pending Payments");

            // Header Row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Payment ID", "Student ID", "Student Name", "Month", "Year", "Due Amount", "Enter UTR Number"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Find all pending payments
            List<Payment> pendingPayments = paymentRepository.findAll().stream()
                    .filter(p -> p.getStatus() != null && p.getStatus().startsWith("PENDING"))
                    .filter(p -> hostelId == null || (p.getStudent().getBed() != null && p.getStudent().getBed().getRoom() != null && p.getStudent().getBed().getRoom().getHostel().getId().equals(hostelId)))
                    .filter(p -> month == null || month.isEmpty() || p.getMonth().equalsIgnoreCase(month))
                    .filter(p -> year == null || year.isEmpty() || p.getYear().equals(year))
                    .toList();

            int rowIdx = 1;
            for (Payment p : pendingPayments) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getStudent().getId());
                row.createCell(2).setCellValue(p.getStudent().getName());
                row.createCell(3).setCellValue(p.getMonth());
                row.createCell(4).setCellValue(p.getYear());
                row.createCell(5).setCellValue(p.getDueAmount() != null ? p.getDueAmount() : (p.getExpectedAmount() != null ? p.getExpectedAmount() : 0.0));
                // Cell 6 is UTR, leave empty
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Override
    @Transactional
    public ManualUtrMappingResultDTO uploadMappingTemplate(MultipartFile file) throws IOException {
        List<ManualUtrMappingRowDTO> details = new ArrayList<>();
        int successful = 0;
        int failed = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Read cells safely
                Cell paymentIdCell = row.getCell(0);
                Cell studentNameCell = row.getCell(2);
                Cell monthCell = row.getCell(3);
                Cell yearCell = row.getCell(4);
                Cell utrCell = row.getCell(6);

                if (paymentIdCell == null || utrCell == null) continue;

                String utr = getCellValueAsString(utrCell).trim();
                String studentName = getCellValueAsString(studentNameCell);
                String month = getCellValueAsString(monthCell);
                String year = getCellValueAsString(yearCell);

                if (utr.isEmpty()) {
                    // Skip if UTR is not entered
                    continue;
                }

                ManualUtrMappingRowDTO.ManualUtrMappingRowDTOBuilder rowResult = ManualUtrMappingRowDTO.builder()
                        .studentName(studentName)
                        .month(month)
                        .year(year)
                        .utrNumber(utr);

                try {
                    Long paymentId = (long) paymentIdCell.getNumericCellValue();
                    Payment payment = paymentRepository.findById(paymentId)
                            .orElseThrow(() -> new IllegalArgumentException("Payment ID not found"));

                    if (!payment.getStatus().startsWith("PENDING")) {
                        throw new IllegalArgumentException("Payment is already completed/paid");
                    }

                    if (paymentRepository.existsByUtrNumber(utr)) {
                        throw new IllegalArgumentException("UTR already exists in payments");
                    }

                    Optional<BankTransaction> bankTxnOpt = bankTransactionRepository.findByUtrNumberAndIsDeletedFalse(utr);
                    if (bankTxnOpt.isEmpty()) {
                        throw new IllegalArgumentException("UTR not found in bank records");
                    }

                    BankTransaction bankTxn = bankTxnOpt.get();
                    if (bankTxn.getIsMapped() != null && bankTxn.getIsMapped()) {
                        throw new IllegalArgumentException("UTR is already mapped to another payment");
                    }

                    // Map it
                    payment.setUtrNumber(utr);
                    payment.setAmount(bankTxn.getAmount().doubleValue());
                    if (payment.getExpectedAmount() != null) {
                        payment.setDueAmount(Math.max(0, payment.getExpectedAmount() - payment.getAmount()));
                    }
                    payment.setStatus("PAID");
                    payment.setPaymentSource("MANUAL_EXCEL_MAP");
                    paymentRepository.save(payment);

                    bankTxn.setIsMapped(true);
                    bankTxn.setMappedStudentId(payment.getStudent().getId());
                    bankTransactionRepository.save(bankTxn);

                    successful++;
                    rowResult.success(true).reason("Successfully mapped");

                } catch (Exception e) {
                    failed++;
                    rowResult.success(false).reason(e.getMessage());
                }

                details.add(rowResult.build());
            }
        }

        return ManualUtrMappingResultDTO.builder()
                .totalRows(successful + failed)
                .successfulRows(successful)
                .failedRows(failed)
                .details(details)
                .build();
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf((long) cell.getNumericCellValue());
            default: return "";
        }
    }
}
