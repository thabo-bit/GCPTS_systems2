package com.gcpts.backend.controller;

import com.gcpts.backend.Services.NotificationService;
import com.gcpts.backend.model.Notification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

  
    @GetMapping("/user/{userId}")
    public List<Notification> listForUser(@PathVariable Long userId) {
        return service.listForUser(userId);
    }

  
    @GetMapping("/user/{userId}/unread")
    public List<Notification> listUnread(@PathVariable Long userId) {
        return service.listUnreadForUser(userId);
    }


    @GetMapping("/user/{userId}/unread-count")
    public Map<String, Object> unreadCount(@PathVariable Long userId) {
        Map<String, Object> res = new HashMap<>();
        res.put("unread", service.unreadCount(userId));
        return res;
    }


    @PostMapping("/user/{userId}/mark-all-read")
    public Map<String, Object> markAllRead(@PathVariable Long userId) {
        int updated = service.markAllRead(userId);
        Map<String, Object> res = new HashMap<>();
        res.put("updated", updated);
        return res;
    }


    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Map<String, Object>> markOneRead(@PathVariable Long id) {
        int updated = service.markOneRead(id);
        Map<String, Object> res = new HashMap<>();
        res.put("updated", updated);
        return ResponseEntity.ok(res);
    }

   
    @PostMapping("/send")
    public Notification send(@RequestBody Map<String, Object> body) {
        Long userId    = Long.valueOf(body.get("userId").toString());
        Long projectId = body.get("projectId") != null
                ? Long.valueOf(body.get("projectId").toString())
                : null;
        String type    = (String) body.getOrDefault("notificationType", "announcement");
        String title   = (String) body.getOrDefault("title", "Notification");
        String message = (String) body.getOrDefault("message", "");

        return service.sendToUser(userId, projectId, type, title, message);
    }

 
    @PostMapping("/broadcast")
    public Map<String, Object> broadcast(@RequestBody Map<String, Object> body) {
        String audience  = (String) body.getOrDefault("audience", "citizens"); // citizens | admins | all
        Long projectId   = body.get("projectId") != null
                ? Long.valueOf(body.get("projectId").toString())
                : null;
        String type      = (String) body.getOrDefault("notificationType", "announcement");
        String title     = (String) body.getOrDefault("title", "Announcement");
        String message   = (String) body.getOrDefault("message", "");

        switch (audience) {
            case "admins" -> service.broadcastToAdmins(projectId, type, title, message);
            case "all"    -> service.broadcastToAll(projectId, type, title, message);
            default       -> service.broadcastToCitizens(projectId, type, title, message);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("sent", true);
        res.put("audience", audience);
        return res;
    }
}