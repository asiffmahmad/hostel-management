package com.hostel.backend.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ReportExportService {
    ByteArrayInputStream generateStudentReportCsv() throws IOException;
    ByteArrayInputStream generateStudentReportPdf() throws IOException;
    
    ByteArrayInputStream generateHostelReportCsv() throws IOException;
    ByteArrayInputStream generateHostelReportPdf() throws IOException;
    
    ByteArrayInputStream generatePaymentReportCsv() throws IOException;
    ByteArrayInputStream generatePaymentReportPdf() throws IOException;
}
