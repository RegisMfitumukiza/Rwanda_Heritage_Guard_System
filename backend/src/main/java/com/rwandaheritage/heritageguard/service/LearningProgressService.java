package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.LearningProgressDTO;
import com.rwandaheritage.heritageguard.mapper.LearningProgressMapper;
import com.rwandaheritage.heritageguard.model.LearningProgress;
import com.rwandaheritage.heritageguard.repository.EducationalArticleRepository;
import com.rwandaheritage.heritageguard.repository.LearningProgressRepository;
import com.rwandaheritage.heritageguard.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningProgressService {

    private final LearningProgressRepository progressRepository;
    private final EducationalArticleRepository articleRepository;
    private final QuizRepository quizRepository;

    /**
     * Create or update learning progress
     */
    public LearningProgressDTO saveProgress(LearningProgressDTO dto) {
        LearningProgress entity = LearningProgressMapper.toEntity(dto);
        LearningProgress saved = progressRepository.save(entity);
        return LearningProgressMapper.toDTO(saved);
    }

    /**
     * Delete a progress entry by id
     */
    public void deleteProgress(Long id) {
        progressRepository.deleteById(id);
    }

    public List<LearningProgressDTO> getAllProgress() {
        log.debug("Fetching all learning progress");
        return progressRepository.findAll().stream()
                .map(LearningProgressMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<LearningProgressDTO> getProgressByUser(Long userId) {
        log.debug("Fetching learning progress for user: {}", userId);
        return progressRepository.findByUserId(userId).stream()
                .map(LearningProgressMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<LearningProgressDTO> getProgressByArticle(Long articleId) {
        log.debug("Fetching learning progress for article: {}", articleId);
        return progressRepository.findByArticleId(articleId).stream()
                .map(LearningProgressMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<LearningProgressDTO> getProgressByQuiz(Long quizId) {
        log.debug("Fetching learning progress for quiz: {}", quizId);
        return progressRepository.findByQuizId(quizId).stream()
                .map(LearningProgressMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getProgressStatistics() {
        log.debug("Fetching learning progress statistics");
        List<LearningProgress> all = progressRepository.findAll();

        long articlesRead = all.stream()
                .filter(p -> p.getArticleId() != null && p.getStatus() == LearningProgress.ProgressStatus.COMPLETED)
                .count();

        long quizzesCompleted = all.stream()
                .filter(p -> p.getQuizId() != null && p.getStatus() == LearningProgress.ProgressStatus.COMPLETED)
                .count();

        double averageScore = all.stream()
                .filter(p -> p.getQuizId() != null && p.getCompletionPercentage() != null)
                .mapToDouble(LearningProgress::getCompletionPercentage)
                .average()
                .orElse(0);

        long totalArticles = articleRepository.count();
        long totalQuizzes = quizRepository.count();

        double articlesProgress = totalArticles == 0 ? 0 : (double) articlesRead * 100 / totalArticles;
        double quizzesProgress = totalQuizzes == 0 ? 0 : (double) quizzesCompleted * 100 / totalQuizzes;

        Set<LocalDate> activityDates = all.stream()
                .filter(p -> p.getLastAccessedDate() != null)
                .map(p -> p.getLastAccessedDate().toLocalDate())
                .collect(Collectors.toSet());

        long streak = 0;
        LocalDate today = LocalDate.now();
        while (activityDates.contains(today.minusDays(streak))) {
            streak++;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("articlesRead", articlesRead);
        stats.put("quizzesCompleted", quizzesCompleted);
        stats.put("averageScore", averageScore);
        stats.put("learningStreak", streak);
        stats.put("articlesProgress", articlesProgress);
        stats.put("quizzesProgress", quizzesProgress);
        stats.put("goals", Collections.emptyList());
        stats.put("categoryProgress", Collections.emptyList());
        return stats;
    }

    public List<Map<String, Object>> getRecentActivity() {
        log.debug("Fetching recent learning activity");
        return progressRepository.findTop10ByOrderByLastAccessedDateDesc().stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("userId", p.getUserId());
                    map.put("articleId", p.getArticleId());
                    map.put("quizId", p.getQuizId());
                    map.put("status", p.getStatus());
                    map.put("lastAccessedDate", p.getLastAccessedDate());
                    map.put("completedDate", p.getCompletedDate());
                    map.put("completionPercentage", p.getCompletionPercentage());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAchievements() {
        log.debug("Fetching learning achievements");
        return progressRepository.findByStatus(LearningProgress.ProgressStatus.COMPLETED).stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("userId", p.getUserId());
                    map.put("articleId", p.getArticleId());
                    map.put("quizId", p.getQuizId());
                    map.put("completedDate", p.getCompletedDate());
                    map.put("type", p.getQuizId() != null ? "QUIZ" : "ARTICLE");
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getQuizHistory() {
        log.debug("Fetching quiz history");
        return progressRepository.findByQuizIdNotNullOrderByCompletedDateDesc().stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("userId", p.getUserId());
                    map.put("quizId", p.getQuizId());
                    map.put("score", p.getCompletionPercentage());
                    map.put("status", p.getStatus());
                    map.put("completedDate", p.getCompletedDate());
                    return map;
                })
                .collect(Collectors.toList());
    }
}

