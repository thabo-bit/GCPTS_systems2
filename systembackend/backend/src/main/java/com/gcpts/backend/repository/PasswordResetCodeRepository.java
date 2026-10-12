package com.gcpts.backend.repository;

import com.gcpts.backend.model.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {

    List<PasswordResetCode> findByEmailAndUsedFalseOrderByIdDesc(String email);

    Optional<PasswordResetCode> findFirstByEmailAndCodeAndUsedFalseOrderByIdDesc(String email, String code);
}