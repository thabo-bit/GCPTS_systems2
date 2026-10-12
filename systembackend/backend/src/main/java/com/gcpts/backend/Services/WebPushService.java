package com.gcpts.backend.Services;

import com.gcpts.backend.model.User;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.security.Security;

@Service
public class WebPushService {

    @Value("${app.push.publicKey}")
    private String publicKey;

    @Value("${app.push.privateKey}")
    private String privateKey;

    @Value("${app.push.subject}")
    private String subject;

    @Async
    public void sendToUser(User user, String title, String body) {
        if (user == null
                || user.getPushEndpoint() == null || user.getPushEndpoint().isBlank()
                || user.getPushP256dh() == null || user.getPushAuth() == null) {
            return;
        }

        try {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }

            PushService push = new PushService();
            push.setPublicKey(publicKey);
            push.setPrivateKey(privateKey);
            push.setSubject(subject);

            Subscription.Keys keys = new Subscription.Keys(
                    user.getPushP256dh(),
                    user.getPushAuth()
            );
            Subscription sub = new Subscription(user.getPushEndpoint(), keys);

            String payload = "{\"title\":\"" + escape(title) + "\","
                    + "\"body\":\"" + escape(body) + "\","
                    + "\"url\":\"/Notifications\"}";

            push.send(new Notification(sub, payload));
            System.out.println("🔔 Push sent to " + user.getEmail());

        } catch (Exception e) {
            System.err.println("❌ Push failed for " + user.getEmail() + ": " + e.getMessage());
        }
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "'")
                .replace("\n", " ")
                .replace("\r", " ");
    }
}