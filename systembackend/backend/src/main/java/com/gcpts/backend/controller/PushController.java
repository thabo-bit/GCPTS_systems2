package com.gcpts.backend.controller;

import com.gcpts.backend.Services.UserService;
import com.gcpts.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/push")
@CrossOrigin(origins = "*")
public class PushController {

    @Autowired
    private UserService userService;

    @PostMapping("/subscribe/{userId}")
    public ResponseEntity<?> subscribe(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body
    ) {
        Optional<User> opt = userService.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        User u = opt.get();
        u.setPushEndpoint(body.get("endpoint"));
        u.setPushP256dh(body.get("p256dh"));
        u.setPushAuth(body.get("auth"));
        userService.save(u);

        System.out.println("✅ Push subscription saved for user " + userId);
        return ResponseEntity.ok(Map.of("subscribed", true));
    }
}