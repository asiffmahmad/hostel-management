package com.hostel.backend.service;

import com.hostel.backend.dto.ManualUtrMappingResultDTO;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface ManualUtrMappingService {
    byte[] generateMappingTemplate(Long hostelId, String month, String year) throws IOException;
    ManualUtrMappingResultDTO uploadMappingTemplate(MultipartFile file) throws IOException;
}
