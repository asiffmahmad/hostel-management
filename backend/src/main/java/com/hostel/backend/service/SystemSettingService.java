package com.hostel.backend.service;

import com.hostel.backend.dto.SystemSettingDTO;
import java.util.List;

public interface SystemSettingService {
    SystemSettingDTO createSetting(SystemSettingDTO settingDTO);
    SystemSettingDTO updateSetting(String key, SystemSettingDTO settingDTO);
    SystemSettingDTO getSettingByKey(String key);
    List<SystemSettingDTO> getAllSettings();
    void deleteSetting(String key);
}
