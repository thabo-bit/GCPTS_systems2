package com.gcpts.backend.controller;

import com.gcpts.backend.Services.EmailService;
import com.gcpts.backend.Services.PasswordResetCodeService;
import com.gcpts.backend.Services.UserService;
import com.gcpts.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class PasswordResetController {

    @Autowired private UserService             userService;
    @Autowired private EmailService            emailService;
    @Autowired private PasswordResetCodeService codeService;

    // ─── STEP 1: Request a 6-digit code ───
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }

        Optional<User> userOpt = userService.findByEmail(email);

        if (userOpt.isPresent()) {
            String code = codeService.generate(userOpt.get().getEmail());
            emailService.sendPasswordResetCode(userOpt.get().getEmail(), code);
            System.out.println("🔢 Reset code for " + email + ": " + code);
        } else {
            System.out.println("⚠️ Forgot-password request for unknown email: " + email);
        }

        // Same response whether or not email exists — prevents enumeration
        return ResponseEntity.ok(Map.of(
                "message", "If that email is registered, a 6-digit code has been sent."
        ));
    }

    // ─── STEP 2: Verify code ───
    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code  = body.get("code");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and code are required."));
        }

        if (!codeService.verify(email, code)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired code."));
        }

        return ResponseEntity.ok(Map.of("message", "Code verified."));
    }

    // ─── STEP 3: Set new password (requires code to still be valid) ───
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email       = body.get("email");
        String code        = body.get("code");
        String newPassword = body.get("newPassword");

        if (email == null || code == null || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Email, code, and a password of at least 8 characters are required."
            ));
        }

        // Re-verify code (this also marks it used)
        if (!codeService.verify(email, code)) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "Invalid or expired code."
            ));
        }

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User no longer exists."));
        }

        userService.updatePassword(userOpt.get(), newPassword);

        return ResponseEntity.ok(Map.of("message", "Password updated. You can now sign in."));
    }
}