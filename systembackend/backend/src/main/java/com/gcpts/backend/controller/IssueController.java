package com.gcpts.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.gcpts.backend.model.Issue;
import com.gcpts.backend.repository.IssueRepository;
import com.gcpts.backend.Services.ImageUploadService;
import com.gcpts.backend.Services.NotificationService;

import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private NotificationService notificationService;

    // ─── CREATE (public — citizens report) ───
    @PostMapping(consumes = "multipart/form-data")
    public Issue createIssue(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String location,
            @RequestParam Long projectId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) MultipartFile image
    ) throws Exception {

        Issue issue = new Issue();
        issue.setTitle(title);
        issue.setDescription(description);
        issue.setCategory(category);
        issue.setLocation(location);
        issue.setProjectId(projectId);
        issue.setUserEmail(userEmail);

        issue.setUsername(
                (username != null && !username.trim().isEmpty())
                        ? username.trim()
                        : "Anonymous"
        );

        issue.setStatus("Reported");

        if (image != null && !image.isEmpty()) {
            String imageUrl = imageUploadService.uploadImage(
                    image.getBytes(),
                    image.getOriginalFilename()
            );
            issue.setImageUrl(imageUrl);
        }

        Issue saved = issueRepository.save(issue);

        // ⭐ NOTIFY EVERYONE
        notificationService.broadcastToAll(
                saved.getProjectId(),
                "announcement",
                "New issue reported: " + saved.getTitle(),
                "Location: " + saved.getLocation() + " — " + saved.getCategory()
        );

        return saved;
    }

    // ─── LIST (public — optional projectId filter) ───
    @GetMapping
    public Iterable<Issue> getAllIssues(
            @RequestParam(required = false) Long projectId
    ) {
        if (projectId != null) {
            return issueRepository.findByProjectIdOrderByIdDesc(projectId);
        }
        return issueRepository.findAll();
    }

    // ─── GET one ───
    @GetMapping("/{id}")
    public ResponseEntity<Issue> getOne(@PathVariable Long id) {
        return issueRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── UPDATE STATUS ───
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
        }

        return issueRepository.findById(id).map(issue -> {
            issue.setStatus(newStatus);
            Issue saved = issueRepository.save(issue);

            // ⭐ NOTIFY EVERYONE
            notificationService.broadcastToAll(
                    saved.getProjectId(),
                    "update",
                    "Issue update: " + saved.getTitle(),
                    "Status changed to " + newStatus
            );

            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── RESOLVE ───
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolve(@PathVariable Long id) {
        return issueRepository.findById(id).map(issue -> {
            issue.setStatus("Resolved");
            Issue saved = issueRepository.save(issue);

            notificationService.broadcastToAll(
                    saved.getProjectId(),
                    "completion",
                    "Issue resolved: " + saved.getTitle(),
                    "This issue has been marked as resolved."
            );

            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── IN PROGRESS ───
    @PutMapping("/{id}/in-progress")
    public ResponseEntity<?> markInProgress(@PathVariable Long id) {
        return issueRepository.findById(id).map(issue -> {
            issue.setStatus("In Progress");
            Issue saved = issueRepository.save(issue);

            notificationService.broadcastToAll(
                    saved.getProjectId(),
                    "update",
                    "Issue in progress: " + saved.getTitle(),
                    "Our team is working on this."
            );

            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── REOPEN ───
    @PutMapping("/{id}/reopen")
    public ResponseEntity<?> reopen(@PathVariable Long id) {
        return issueRepository.findById(id).map(issue -> {
            issue.setStatus("Reported");
            Issue saved = issueRepository.save(issue);

            notificationService.broadcastToAll(
                    saved.getProjectId(),
                    "update",
                    "Issue reopened: " + saved.getTitle(),
                    "Status set back to Reported."
            );

            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── ASSIGN ───
    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assign(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String assignedTo = body.get("assignedTo");
        return issueRepository.findById(id).map(issue -> {
            issue.setAssignedTo(assignedTo);
            Issue saved = issueRepository.save(issue);

            notificationService.broadcastToAll(
                    saved.getProjectId(),
                    "update",
                    "Issue assigned: " + saved.getTitle(),
                    "Assigned to " + assignedTo
            );

            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── NOTE ───
    @PatchMapping("/{id}/note")
    public ResponseEntity<?> updateNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String note = body.get("adminNote");
        return issueRepository.findById(id).map(issue -> {
            issue.setAdminNote(note);
            Issue saved = issueRepository.save(issue);

            notificationService.broadcastToAll(
                    saved.getProjectId(),
                    "update",
                    "Update on issue: " + saved.getTitle(),
                    note
            );

            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── DELETE ───
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!issueRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        issueRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }
}