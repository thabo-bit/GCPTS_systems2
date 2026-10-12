package com.gcpts.backend.Services;

import com.gcpts.backend.model.Notification;
import com.gcpts.backend.model.User;
import com.gcpts.backend.repository.NotificationRepository;
import com.gcpts.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;
    private final WebPushService webPushService;

    public NotificationService(NotificationRepository notificationRepo,
                               UserRepository userRepo,
                               WebPushService webPushService) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
        this.webPushService = webPushService;
    }

    public Notification sendToUser(Long userId, Long projectId,
                                   String type, String title, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setProjectId(projectId);
        n.setNotificationType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setRead(false);
        Notification saved = notificationRepo.save(n);

        // ⭐ Send browser push
        userRepo.findById(userId).ifPresent(u ->
                webPushService.sendToUser(u, title, message)
        );

        return saved;
    }

    public void broadcastToAll(Long projectId, String type,
                               String title, String message) {
        List<User> everyone = userRepo.findAll();
        for (User u : everyone) {
            sendToUser(u.getId(), projectId, type, title, message);
        }
    }

    public void broadcastToCitizens(Long p, String t, String ti, String m) { broadcastToAll(p, t, ti, m); }
    public void broadcastToAdmins(Long p, String t, String ti, String m)   { broadcastToAll(p, t, ti, m); }

    public List<Notification> listForUser(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> listUnreadForUser(Long userId) {
        return notificationRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(Long userId) {
        return notificationRepo.countByUserIdAndIsReadFalse(userId);
    }

    public int markAllRead(Long userId) {
        return notificationRepo.markAllAsRead(userId);
    }

    public int markOneRead(Long id) {
        return notificationRepo.markOneAsRead(id);
    }
}