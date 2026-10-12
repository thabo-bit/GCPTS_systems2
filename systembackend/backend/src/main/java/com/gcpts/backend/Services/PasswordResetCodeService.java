package com.gcpts.backend.Services;

import com.gcpts.backend.model.PasswordResetCode;
import com.gcpts.backend.repository.PasswordResetCodeRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetCodeService {

    private final PasswordResetCodeRepository repo;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetCodeService(PasswordResetCodeRepository repo) {
        this.repo = repo;
    }

    /** Generates a fresh 6-digit code for the email, invalidating old ones. */
    public String generate(String email) {
        // Invalidate all previous codes for this email
        repo.findByEmailAndUsedFalseOrderByIdDesc(email)
            .forEach(c -> { c.setUsed(true); repo.save(c); });

        // Generate 6-digit code (100000 - 999999)
        int n = 100000 + random.nextInt(900000);
        String code = String.valueOf(n);

        PasswordResetCode entity = new PasswordResetCode(
                email,
                code,
                LocalDateTime.now().plusMinutes(15)
        );
        repo.save(entity);
        return code;
    }

    /** Returns true if code is valid and not expired. */
    public boolean verify(String email, String code) {
        Optional<PasswordResetCode> opt =
                repo.findFirstByEmailAndCodeAndUsedFalseOrderByIdDesc(email, code);

        if (opt.isEmpty()) return false;

        PasswordResetCode prc = opt.get();
        if (prc.getExpiresAt().isBefore(LocalDateTime.now())) return false;

        // Mark used so it can't be reused
        prc.setUsed(true);
        repo.save(prc);
        return true;
    }
}