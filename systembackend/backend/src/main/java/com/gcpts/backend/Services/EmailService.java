package com.gcpts.backend.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    // ═══════════════════════════════════════════════
    //  Password reset — sends a 6-digit code
    // ═══════════════════════════════════════════════
    @Async
    public void sendPasswordResetCode(String toEmail, String code) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(toEmail);
            msg.setSubject("GCPTS — Your Password Reset Code");
            msg.setText(
                "Hello,\n\n" +
                "You requested to reset your GCPTS password.\n\n" +
                "Your verification code is:\n\n" +
                "        " + code + "\n\n" +
                "Enter this code on the reset password page. It expires in 15 minutes.\n\n" +
                "If you didn't request this, you can safely ignore this email — " +
                "your password will not change.\n\n" +
                "— Government Community Project Tracking System"
            );
            mailSender.send(msg);
            System.out.println("📧 Reset code sent to " + toEmail + " (code: " + code + ")");
        } catch (Exception e) {
            System.err.println("❌ Failed to send reset code to " + toEmail + ": " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════
    //  Password reset — link version (kept for reference)
    // ═══════════════════════════════════════════════
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(toEmail);
            msg.setSubject("GCPTS — Password Reset Request");
            msg.setText(
                "Hello,\n\n" +
                "We received a request to reset the password for your GCPTS account.\n\n" +
                "Click the link below to set a new password. This link expires in 15 minutes:\n\n" +
                resetLink + "\n\n" +
                "If you didn't request this, you can safely ignore this email.\n\n" +
                "— Government Community Project Tracking System"
            );
            mailSender.send(msg);
            System.out.println("📧 Reset email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send reset email to " + toEmail + ": " + e.getMessage());
        }
    }
}