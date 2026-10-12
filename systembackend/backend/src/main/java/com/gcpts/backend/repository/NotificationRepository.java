package com.gcpts.backend.repository;

import com.gcpts.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ─── List all for a user, newest first ───
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // ─── Only unread ───
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // ─── Count unread for badge ───
    long countByUserIdAndIsReadFalse(Long userId);

    // ─── List by project (useful for project detail page) ───
    List<Notification> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    // ─── Bulk mark-all-read ───
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);

    // ─── Mark one as read ───
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    int markOneAsRead(@Param("id") Long id);
}