package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.LearningProgressDTO;
import com.rwandaheritage.heritageguard.service.LearningProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/education/progress")
@RequiredArgsConstructor
@Slf4j
public class LearningProgressController {

    private final LearningProgressService progressService;

    @PostMapping
    public ResponseEntity<LearningProgressDTO> createProgress(@RequestBody LearningProgressDTO progressDTO) {
        log.debug("Request to create learning progress");
        return ResponseEntity.ok(progressService.saveProgress(progressDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningProgressDTO> updateProgress(@PathVariable Long id, @RequestBody LearningProgressDTO progressDTO) {
        log.debug("Request to update learning progress {}", id);
        progressDTO.setId(id);
        return ResponseEntity.ok(progressService.saveProgress(progressDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable Long id) {
        log.debug("Request to delete learning progress {}", id);
        progressService.deleteProgress(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<LearningProgressDTO>> getAllProgress() {
        log.debug("Request to get all learning progress");
        return ResponseEntity.ok(progressService.getAllProgress());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningProgressDTO>> getProgressByUser(@PathVariable Long userId) {
        log.debug("Request to get learning progress for user {}", userId);
        return ResponseEntity.ok(progressService.getProgressByUser(userId));
    }

    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<LearningProgressDTO>> getProgressByArticle(@PathVariable Long articleId) {
        log.debug("Request to get learning progress for article {}", articleId);
        return ResponseEntity.ok(progressService.getProgressByArticle(articleId));
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<LearningProgressDTO>> getProgressByQuiz(@PathVariable Long quizId) {
        log.debug("Request to get learning progress for quiz {}", quizId);
        return ResponseEntity.ok(progressService.getProgressByQuiz(quizId));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getProgressStatistics() {
        log.debug("Request to get learning progress statistics");
        return ResponseEntity.ok(progressService.getProgressStatistics());
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity() {
        log.debug("Request to get recent learning activity");
        return ResponseEntity.ok(progressService.getRecentActivity());
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<Map<String, Object>>> getAchievements() {
        log.debug("Request to get learning achievements");
        return ResponseEntity.ok(progressService.getAchievements());
    }

    @GetMapping("/quiz-history")
    public ResponseEntity<List<Map<String, Object>>> getQuizHistory() {
        log.debug("Request to get quiz history");
        return ResponseEntity.ok(progressService.getQuizHistory());
    }
}

