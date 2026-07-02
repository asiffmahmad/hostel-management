package com.hostel.backend.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ReportExportService {
    ByteArrayInputStream generateStudentReportCsv(Long hostelId) throws IOException;
    ByteArrayInputStream generateStudentReportPdf(Long hostelId) throws IOException;
    
    ByteArrayInputStream generateHostelReportCsv(Long hostelId) throws IOException;
    ByteArrayInputStream generateHostelReportPdf(Long hostelId) throws IOException;
    
    ByteArrayInputStream generatePaymentReportCsv() throws IOException;
    ByteArrayInputStream generatePaymentReportPdf() throws IOException;
}
