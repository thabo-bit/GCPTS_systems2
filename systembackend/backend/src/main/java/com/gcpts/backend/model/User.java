package com.gcpts.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String mobile;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String userType = "user"; // "admin" | "user"

    // ⭐ Web Push fields (NEW)
    @Column(name = "push_endpoint", length = 500)
    private String pushEndpoint;

    @Column(name = "push_p256dh", length = 255)
    private String pushP256dh;

    @Column(name = "push_auth", length = 255)
    private String pushAuth;

    public User() {}

    // 4-arg constructor (kept for backwards compatibility — defaults to "user")
    public User(String fullName, String email, String mobile, String password) {
        this.fullName = fullName;
        this.email = email;
        this.mobile = mobile;
        this.password = password;
        this.userType = "user";
    }

    // 5-arg constructor
    public User(String fullName, String email, String mobile, String password, String userType) {
        this.fullName = fullName;
        this.email = email;
        this.mobile = mobile;
        this.password = password;
        this.userType = userType != null ? userType : "user";
    }

    // ─── Getters & Setters ───
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    // ⭐ Push accessors (NEW)
    public String getPushEndpoint() { return pushEndpoint; }
    public void setPushEndpoint(String pushEndpoint) { this.pushEndpoint = pushEndpoint; }

    public String getPushP256dh() { return pushP256dh; }
    public void setPushP256dh(String pushP256dh) { this.pushP256dh = pushP256dh; }

    public String getPushAuth() { return pushAuth; }
    public void setPushAuth(String pushAuth) { this.pushAuth = pushAuth; }
}