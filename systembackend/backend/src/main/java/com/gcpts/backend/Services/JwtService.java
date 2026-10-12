package com.gcpts.backend.Services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    // Must be at least 32 characters for HS256
    private static final String SECRET =
            "gcpts-super-secret-key-change-me-in-production-2026";

    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 24;      // 24 hours
    private static final long RESET_EXPIRATION_MS = 1000L * 60 * 15;     // 15 minutes

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    // ─── Existing: auth token ───
    public String generateToken(String email, String fullName, String userType) {
        return Jwts.builder()
                .claims(Map.of(
                        "fullName", fullName,
                        "userType", userType
                ))
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ⭐ NEW: password reset token (short-lived, purpose-scoped)
    public String generateResetToken(String email) {
        return Jwts.builder()
                .claims(Map.of("purpose", "password-reset"))
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + RESET_EXPIRATION_MS))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ⭐ NEW: verify reset token → return email, or null if invalid
    public String verifyResetToken(String token) {
        try {
            Claims claims = parseToken(token);
            String purpose = claims.get("purpose", String.class);
            if (!"password-reset".equals(purpose)) return null;
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}