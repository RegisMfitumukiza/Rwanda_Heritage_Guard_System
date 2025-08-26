package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.*;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.service.QuizService;
import com.rwandaheritage.heritageguard.service.QuizEvaluationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/education/quizzes")
public class QuizController {
    
    private final QuizService quizService;
    private final QuizEvaluationService evaluationService;

    @Autowired
    public QuizController(QuizService quizService, QuizEvaluationService evaluationService) {
        this.quizService = quizService;
        this.evaluationService = evaluationService;
    }

    // ===== QUIZ MANAGEMENT ENDPOINTS =====

    /**
     * Create a new quiz
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can create
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizDTO> createQuiz(@Valid @RequestBody QuizDTO quizDTO) {
        QuizDTO created = quizService.createQuiz(quizDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/full")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizCreationDTO> createFullQuiz(@Valid @RequestBody QuizCreationDTO creationDTO) {
        QuizCreationDTO created = quizService.createQuizWithQuestions(creationDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Get quiz by ID
     * Public if isPublic=true, else requires COMMUNITY_MEMBER or higher
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable Long id) {
        QuizDTO quiz = quizService.getQuiz(id);
        return ResponseEntity.ok(quiz);
    }

    /**
     * List all quizzes (filtered by access)
     * Public sees only public quizzes, others see all they are allowed
     */
    @GetMapping
    public ResponseEntity<List<QuizDTO>> listQuizzes() {
        List<QuizDTO> quizzes = quizService.listQuizzes();
        return ResponseEntity.ok(quizzes);
    }

    /**
     * List quizzes by article
     * Public access for public quizzes
     */
    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<QuizDTO>> listQuizzesByArticle(@PathVariable Long articleId) {
        List<QuizDTO> quizzes = quizService.listQuizzesByArticle(articleId);
        return ResponseEntity.ok(quizzes);
    }

    /**
     * Search quizzes
     * Public access for public quizzes
     */
    @GetMapping("/search")
    public ResponseEntity<List<QuizDTO>> searchQuizzes(@RequestParam String searchTerm) {
        List<QuizDTO> quizzes = quizService.searchQuizzes(searchTerm);
        return ResponseEntity.ok(quizzes);
    }
    
    /**
     * Get quizzes by tag
     * Public access for public quizzes
     */
    @GetMapping("/tags/{tag}")
    public ResponseEntity<List<QuizDTO>> getQuizzesByTag(@PathVariable String tag) {
        List<QuizDTO> quizzes = quizService.getQuizzesByTag(tag);
        return ResponseEntity.ok(quizzes);
    }
    
    /**
     * Get all quizzes with tags
     * Public access for public quizzes
     */
    @GetMapping("/with-tags")
    public ResponseEntity<List<QuizDTO>> getQuizzesWithTags() {
        List<QuizDTO> quizzes = quizService.getQuizzesWithTags();
        return ResponseEntity.ok(quizzes);
    }

    /**
     * Get quiz in specific language
     * Public access for public quizzes
     */
    @GetMapping("/{id}/language/{languageCode}")
    public ResponseEntity<QuizDTO> getQuizInLanguage(
            @PathVariable Long id, @PathVariable String languageCode) {
        QuizDTO quiz = quizService.getQuizInLanguage(id, languageCode);
        return ResponseEntity.ok(quiz);
    }

    /**
     * Get quiz for current user (using user's preferred language)
     * Requires authentication
     */
    @GetMapping("/{id}/user")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<QuizDTO> getQuizForUser(@PathVariable Long id) {
        // TODO: Get current user from authentication context
        // For now, using null user which will fallback to default language
        QuizDTO quiz = quizService.getQuizForUser(id, null);
        return ResponseEntity.ok(quiz);
    }

    /**
     * List quizzes in specific language
     * Public access for public quizzes
     */
    @GetMapping("/language/{languageCode}")
    public ResponseEntity<List<QuizDTO>> listQuizzesInLanguage(@PathVariable String languageCode) {
        List<QuizDTO> quizzes = quizService.listQuizzesInLanguage(languageCode);
        return ResponseEntity.ok(quizzes);
    }

    /**
     * List quizzes for current user (using user's preferred language)
     * Requires authentication
     */
    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<QuizDTO>> listQuizzesForUser() {
        // TODO: Get current user from authentication context
        // For now, using null user which will fallback to default language
        List<QuizDTO> quizzes = quizService.listQuizzesForUser(null);
        return ResponseEntity.ok(quizzes);
    }

    /**
     * Update quiz
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can update
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizDTO quizDTO) {
        QuizDTO updated = quizService.updateQuiz(id, quizDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete quiz (soft delete)
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can delete
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    // ===== QUESTION MANAGEMENT ENDPOINTS =====

    /**
     * Create a question for a quiz
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can create
     */
    @PostMapping("/questions")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizQuestionDTO> createQuestion(@Valid @RequestBody QuizQuestionDTO questionDTO) {
        QuizQuestionDTO created = quizService.createQuestion(questionDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Get question by ID
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can view
     */
    @GetMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizQuestionDTO> getQuestion(@PathVariable Long id) {
        QuizQuestionDTO question = quizService.getQuestion(id);
        return ResponseEntity.ok(question);
    }

    /**
     * Get question in specific language
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can view
     */
    @GetMapping("/questions/{id}/language/{languageCode}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizQuestionDTO> getQuestionInLanguage(
            @PathVariable Long id, @PathVariable String languageCode) {
        QuizQuestionDTO question = quizService.getQuestionInLanguage(id, languageCode);
        return ResponseEntity.ok(question);
    }

    /**
     * List questions for a quiz
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can view
     */
    @GetMapping("/{quizId}/questions")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<List<QuizQuestionDTO>> listQuestionsByQuiz(@PathVariable Long quizId) {
        List<QuizQuestionDTO> questions = quizService.listQuestionsByQuiz(quizId);
        return ResponseEntity.ok(questions);
    }

    /**
     * Update question
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can update
     */
    @PutMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizQuestionDTO> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuizQuestionDTO questionDTO) {
        QuizQuestionDTO updated = quizService.updateQuestion(id, questionDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete question (soft delete)
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can delete
     */
    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        quizService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // ===== OPTION MANAGEMENT ENDPOINTS =====

    /**
     * Create an option for a question
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can create
     */
    @PostMapping("/options")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizOptionDTO> createOption(@Valid @RequestBody QuizOptionDTO optionDTO) {
        QuizOptionDTO created = quizService.createOption(optionDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Get option by ID
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can view
     */
    @GetMapping("/options/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizOptionDTO> getOption(@PathVariable Long id) {
        QuizOptionDTO option = quizService.getOption(id);
        return ResponseEntity.ok(option);
    }

    /**
     * Get option in specific language
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can view
     */
    @GetMapping("/options/{id}/language/{languageCode}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizOptionDTO> getOptionInLanguage(
            @PathVariable Long id, @PathVariable String languageCode) {
        QuizOptionDTO option = quizService.getOptionInLanguage(id, languageCode);
        return ResponseEntity.ok(option);
    }

    /**
     * List options for a question
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can view
     */
    @GetMapping("/questions/{questionId}/options")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<List<QuizOptionDTO>> listOptionsByQuestion(@PathVariable Long questionId) {
        List<QuizOptionDTO> options = quizService.listOptionsByQuestion(questionId);
        return ResponseEntity.ok(options);
    }

    /**
     * Update option
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can update
     */
    @PutMapping("/options/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<QuizOptionDTO> updateOption(@PathVariable Long id, @Valid @RequestBody QuizOptionDTO optionDTO) {
        QuizOptionDTO updated = quizService.updateOption(id, optionDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete option (soft delete)
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can delete
     */
    @DeleteMapping("/options/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<Void> deleteOption(@PathVariable Long id) {
        quizService.deleteOption(id);
        return ResponseEntity.noContent().build();
    }

    // ===== QUIZ ATTEMPT ENDPOINTS =====

    /**
     * Start a new quiz attempt
     * Requires COMMUNITY_MEMBER or higher
     */
    @PostMapping("/{quizId}/attempt")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<QuizAttemptDTO> startQuizAttempt(@PathVariable Long quizId) {
        QuizAttemptDTO attempt = evaluationService.startQuizAttempt(quizId);
        return new ResponseEntity<>(attempt, HttpStatus.CREATED);
    }

    /**
     * Submit quiz answers and get results
     * Requires COMMUNITY_MEMBER or higher
     */
    @PostMapping("/attempt/{attemptId}/submit")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<QuizAttemptDTO> submitQuizAttempt(
            @PathVariable Long attemptId,
            @RequestBody Map<Long, Long> questionAnswers) {
        QuizAttemptDTO result = evaluationService.submitQuizAttempt(attemptId, questionAnswers);
        return ResponseEntity.ok(result);
    }

    /**
     * Get quiz attempt by ID
     * Users can only view their own attempts
     */
    @GetMapping("/attempt/{attemptId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<QuizAttemptDTO> getQuizAttempt(@PathVariable Long attemptId) {
        QuizAttemptDTO attempt = evaluationService.getQuizAttempt(attemptId);
        return ResponseEntity.ok(attempt);
    }

    /**
     * Get detailed results for a quiz attempt
     * Users can only view their own results
     */
    @GetMapping("/attempt/{attemptId}/results")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<QuizResultDTO>> getQuizAttemptResults(@PathVariable Long attemptId) {
        List<QuizResultDTO> results = evaluationService.getQuizAttemptResults(attemptId);
        return ResponseEntity.ok(results);
    }

    /**
     * Get all attempts for a user
     * Users can only view their own attempts, admins can view any
     */
    @GetMapping("/user/{userId}/attempts")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<QuizAttemptDTO>> getUserAttempts(@PathVariable String userId) {
        List<QuizAttemptDTO> attempts = evaluationService.getUserAttempts(userId);
        return ResponseEntity.ok(attempts);
    }

    /**
     * Get attempts for a specific quiz by user
     * Users can only view their own attempts, admins can view any
     */
    @GetMapping("/{quizId}/user/{userId}/attempts")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<QuizAttemptDTO>> getUserQuizAttempts(
            @PathVariable Long quizId,
            @PathVariable String userId) {
        List<QuizAttemptDTO> attempts = evaluationService.getUserQuizAttempts(quizId, userId);
        return ResponseEntity.ok(attempts);
    }

    // ===== STATISTICS ENDPOINTS =====

    /**
     * Get quiz statistics for a user
     * Users can only view their own statistics, admins can view any
     */
    @GetMapping("/user/{userId}/statistics")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<Map<String, Object>> getUserQuizStatistics(@PathVariable String userId) {
        Map<String, Object> statistics = evaluationService.getUserQuizStatistics(userId);
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get quiz statistics for a specific quiz
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can view
     */
    @GetMapping("/{quizId}/statistics")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(@PathVariable Long quizId) {
        Map<String, Object> statistics = evaluationService.getQuizStatistics(quizId);
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get general quiz statistics
     * Public access
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getGeneralQuizStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalQuizzes", quizService.getTotalQuizCount());
        stats.put("publicQuizzes", quizService.getPublicQuizCount());
        stats.put("totalQuestions", quizService.getTotalQuestionCount());
        stats.put("totalAttempts", evaluationService.getTotalAttemptCount());
        return ResponseEntity.ok(stats);
    }
} 