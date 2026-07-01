package com.hostel.backend.controller;

import com.hostel.backend.service.ReportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportExportService reportExportService;

    @GetMapping("/students/csv")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<InputStreamResource> exportStudentsCsv() throws IOException {
        String filename = "students_report.csv";
        InputStreamResource file = new InputStreamResource(reportExportService.generateStudentReportCsv());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/csv"))
                .body(file);
    }

    @GetMapping("/students/pdf")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<InputStreamResource> exportStudentsPdf() throws IOException {
        String filename = "students_report.pdf";
        InputStreamResource file = new InputStreamResource(reportExportService.generateStudentReportPdf());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @GetMapping("/hostels/csv")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<InputStreamResource> exportHostelsCsv() throws IOException {
        String filename = "hostels_report.csv";
        InputStreamResource file = new InputStreamResource(reportExportService.generateHostelReportCsv());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/csv"))
                .body(file);
    }

    @GetMapping("/hostels/pdf")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<InputStreamResource> exportHostelsPdf() throws IOException {
        String filename = "hostels_report.pdf";
        InputStreamResource file = new InputStreamResource(reportExportService.generateHostelReportPdf());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @GetMapping("/payments/csv")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<InputStreamResource> exportPaymentsCsv() throws IOException {
        String filename = "payments_report.csv";
        InputStreamResource file = new InputStreamResource(reportExportService.generatePaymentReportCsv());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/csv"))
                .body(file);
    }

    @GetMapping("/payments/pdf")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<InputStreamResource> exportPaymentsPdf() throws IOException {
        String filename = "payments_report.pdf";
        InputStreamResource file = new InputStreamResource(reportExportService.generatePaymentReportPdf());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
}
