package com.hostel.backend.service;

import com.hostel.backend.entity.Student;
import com.hostel.backend.entity.User;
import com.hostel.backend.repository.StudentRepository;
import com.hostel.backend.repository.UserRepository;
import com.hostel.backend.security.EncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityMigrationService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;

    @Transactional
    public void runPhase2Migration() {
        log.info("Starting Phase 2 Security Migration: Encrypting existing PII data...");

        List<Student> students = studentRepository.findAll();
        int studentCount = 0;
        for (Student student : students) {
            boolean updated = false;

            if (student.getPhone() != null && !student.getPhone().contains("XXXXX")) {
                if (student.getPhoneEncrypted() == null) {
                    student.setPhoneEncrypted(encryptionService.encrypt(student.getPhone()));
                    student.setPhoneHash(encryptionService.generateHash(student.getPhone()));
                }
                updated = true;
            }
            if (student.getParentPhone() != null && !student.getParentPhone().contains("XXXXX")) {
                if (student.getParentPhoneEncrypted() == null) {
                    student.setParentPhoneEncrypted(encryptionService.encrypt(student.getParentPhone()));
                    student.setParentPhoneHash(encryptionService.generateHash(student.getParentPhone()));
                }
                updated = true;
            }
            if (student.getFatherPhone() != null && !student.getFatherPhone().contains("XXXXX")) {
                if (student.getFatherPhoneEncrypted() == null) {
                    student.setFatherPhoneEncrypted(encryptionService.encrypt(student.getFatherPhone()));
                    student.setFatherPhoneHash(encryptionService.generateHash(student.getFatherPhone()));
                }
                updated = true;
            }
            if (student.getMotherPhone() != null && !student.getMotherPhone().contains("XXXXX")) {
                if (student.getMotherPhoneEncrypted() == null) {
                    student.setMotherPhoneEncrypted(encryptionService.encrypt(student.getMotherPhone()));
                    student.setMotherPhoneHash(encryptionService.generateHash(student.getMotherPhone()));
                }
                updated = true;
            }
            if (student.getGuardianPhone() != null && !student.getGuardianPhone().contains("XXXXX")) {
                if (student.getGuardianPhoneEncrypted() == null) {
                    student.setGuardianPhoneEncrypted(encryptionService.encrypt(student.getGuardianPhone()));
                    student.setGuardianPhoneHash(encryptionService.generateHash(student.getGuardianPhone()));
                }
                updated = true;
            }
            if (student.getEmail() != null && !student.getEmail().contains("XXXXX")) {
                if (student.getEmailEncrypted() == null) {
                    student.setEmailEncrypted(encryptionService.encrypt(student.getEmail()));
                    student.setEmailHash(encryptionService.generateHash(student.getEmail()));
                }
                updated = true;
            }
            if (student.getAddress() != null && !student.getAddress().startsWith("ENCRYPTED_MASK")) {
                if (student.getAddressEncrypted() == null) {
                    student.setAddressEncrypted(encryptionService.encrypt(student.getAddress()));
                }
                updated = true;
            }

            if (updated) {
                studentRepository.save(student);
                studentCount++;
            }
        }
        log.info("Successfully encrypted PII for {} students.", studentCount);

        List<User> users = userRepository.findAll();
        int userCount = 0;
        for (User user : users) {
            boolean updated = false;

            if (user.getPhone() != null && !user.getPhone().contains("XXXXX")) {
                if (user.getPhoneEncrypted() == null) {
                    user.setPhoneEncrypted(encryptionService.encrypt(user.getPhone()));
                    user.setPhoneHash(encryptionService.generateHash(user.getPhone()));
                }
                updated = true;
            }
            if (user.getEmail() != null && !user.getEmail().contains("XXXXX")) {
                if (user.getEmailEncrypted() == null) {
                    user.setEmailEncrypted(encryptionService.encrypt(user.getEmail()));
                    user.setEmailHash(encryptionService.generateHash(user.getEmail()));
                }
                updated = true;
            }

            if (updated) {
                userRepository.save(user);
                userCount++;
            }
        }
        log.info("Successfully encrypted PII for {} users.", userCount);
        log.info("Phase 2 Security Migration Completed Successfully.");
    }
}
