package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.*;
import com.rwandaheritage.heritageguard.mapper.*;
import com.rwandaheritage.heritageguard.model.*;
import com.rwandaheritage.heritageguard.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizEvaluationService {
    
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizResultRepository resultRepository;

    @Autowired
    public QuizEvaluationService(QuizRepository quizRepository,
                                QuizQuestionRepository questionRepository,
                                QuizOptionRepository optionRepository,
                                QuizAttemptRepository attemptRepository,
                                QuizResultRepository resultRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.attemptRepository = attemptRepository;
        this.resultRepository = resultRepository;
    }

    // Start a new quiz attempt
    public QuizAttemptDTO startQuizAttempt(Long quizId) {
        // Allow public access for taking quizzes
        String userId = getCurrentUsernameOrGuest();
        
        // Validate quiz exists and is active
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        
        if (!quiz.isActive() || !quiz.isPublic()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Quiz is not available");
        }
        
        // For guest users, we'll use a session-based approach or limit attempts differently
        if (isGuestUser()) {
            // Guest users get unlimited attempts but no persistent storage
            userId = "guest_" + System.currentTimeMillis();
        } else {
            // Check if authenticated user has exceeded max attempts
            Long currentAttempts = attemptRepository.countAttemptsByQuizAndUser(quizId, userId);
            if (quiz.getMaxAttempts() != null && currentAttempts >= quiz.getMaxAttempts()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Maximum attempts exceeded for this quiz");
            }
        }
        
        // Create new attempt
        Integer attemptNumber = 1; // Guest users always start with 1
        if (!isGuestUser()) {
            Integer existingAttemptNumber = attemptRepository.findMaxAttemptNumberByQuizAndUser(quizId, userId);
            if (existingAttemptNumber != null) {
                attemptNumber = existingAttemptNumber + 1;
            }
        }
        
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quizId);
        attempt.setUserId(userId);
        attempt.setStartTime(LocalDateTime.now());
        attempt.setAttemptNumber(attemptNumber);
        attempt.setIsCompleted(false);
        attempt.setPassed(false);
        attempt.setCreatedBy(userId);
        attempt.setCreatedDate(LocalDateTime.now());
        
        QuizAttempt savedAttempt = attemptRepository.save(attempt);
        return QuizAttemptDTO.builder()
            .id(savedAttempt.getId())
            .quizId(savedAttempt.getQuizId())
            .userId(savedAttempt.getUserId())
            .startTime(savedAttempt.getStartTime())
            .attemptNumber(savedAttempt.getAttemptNumber())
            .isCompleted(savedAttempt.isCompleted())
            .passed(savedAttempt.isPassed())
            .createdBy(savedAttempt.getCreatedBy())
            .createdDate(savedAttempt.getCreatedDate())
            .build();
    }

    // Submit quiz answers and calculate results
    public QuizAttemptDTO submitQuizAttempt(Long attemptId, Map<Long, Long> questionAnswers) {
        // Allow public access for taking quizzes
        String userId = getCurrentUsernameOrGuest();
        
        // Get the attempt
        QuizAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz attempt not found"));
        
        // For guest users, we'll be more lenient with ownership verification
        if (!isGuestUser() && !attempt.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only submit your own quiz attempts");
        }
        
        // Check if already completed
        if (attempt.isCompleted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz attempt already completed");
        }
        
        // Get quiz details
        Quiz quiz = quizRepository.findById(attempt.getQuizId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        
        // Get all questions for the quiz
        List<QuizQuestion> questions = questionRepository.findByQuizIdAndIsActiveTrueOrderByQuestionOrderAsc(attempt.getQuizId());
        
        // Calculate results
        int totalScore = 0;
        int maxPossibleScore = 0;
        
        for (QuizQuestion question : questions) {
            maxPossibleScore += question.getPoints();
            
            Long selectedOptionId = questionAnswers.get(question.getId());
            if (selectedOptionId != null) {
                // Check if the selected option is correct
                List<QuizOption> correctOptions = optionRepository.findByQuestionIdAndIsCorrectTrue(question.getId());
                boolean isCorrect = correctOptions.stream()
                    .anyMatch(option -> option.getId().equals(selectedOptionId));
                
                int pointsEarned = isCorrect ? question.getPoints() : 0;
                totalScore += pointsEarned;
                
                // Save individual question result
                QuizResult result = new QuizResult();
                result.setAttemptId(attemptId);
                result.setQuestionId(question.getId());
                result.setSelectedOptionId(selectedOptionId);
                result.setCorrect(isCorrect);
                result.setPointsEarned(pointsEarned);
                result.setMaxPoints(question.getPoints());
                result.setCreatedBy(userId);
                result.setCreatedDate(LocalDateTime.now());
                
                resultRepository.save(result);
            }
        }
        
        // Calculate percentage score
        double percentageScore = maxPossibleScore > 0 ? (double) totalScore / maxPossibleScore * 100 : 0;
        
        // Determine if passed
        boolean passed = percentageScore >= quiz.getPassingScorePercentage();
        
        // Calculate time taken
        Duration timeTaken = Duration.between(attempt.getStartTime(), LocalDateTime.now());
        int timeTakenMinutes = (int) timeTaken.toMinutes();
        
        // Update attempt with results
        attempt.setEndTime(LocalDateTime.now());
        attempt.setTotalScore(totalScore);
        attempt.setMaxPossibleScore(maxPossibleScore);
        attempt.setPercentageScore(percentageScore);
        attempt.setPassed(passed);
        attempt.setTimeTakenMinutes(timeTakenMinutes);
        attempt.setIsCompleted(true);
        attempt.setUpdatedBy(userId);
        attempt.setUpdatedDate(LocalDateTime.now());
        
        QuizAttempt savedAttempt = attemptRepository.save(attempt);
        return QuizAttemptMapper.toDTO(savedAttempt);
    }

    // Get quiz attempt by ID
    public QuizAttemptDTO getQuizAttempt(Long attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz attempt not found"));
        
        // For guest users, we'll be more lenient with access
        if (!isGuestUser()) {
            String userId = getCurrentUsername();
            if (!attempt.getUserId().equals(userId)) {
                throw new AccessDeniedException("You can only view your own quiz attempts");
            }
        }
        
        return QuizAttemptMapper.toDTO(attempt);
    }

    // Get all attempts for a user
    public List<QuizAttemptDTO> getUserAttempts(String userId) {
        enforceCanViewUserAttempts(userId);
        
        List<QuizAttempt> attempts = attemptRepository.findByUserIdOrderByCreatedDateDesc(userId);
        return attempts.stream()
            .map(QuizAttemptMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Get attempts for a specific quiz by user
    public List<QuizAttemptDTO> getUserQuizAttempts(Long quizId, String userId) {
        enforceCanViewUserAttempts(userId);
        
        List<QuizAttempt> attempts = attemptRepository.findByQuizIdAndUserIdAndIsCompletedTrueOrderByCreatedDateDesc(quizId, userId);
        return attempts.stream()
            .map(QuizAttemptMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Get detailed results for a quiz attempt
    public List<QuizResultDTO> getQuizAttemptResults(Long attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz attempt not found"));
        
        // For guest users, we'll be more lenient with access
        if (!isGuestUser()) {
            String userId = getCurrentUsername();
            if (!attempt.getUserId().equals(userId)) {
                throw new AccessDeniedException("You can only view your own quiz results");
            }
        }
        
        List<QuizResult> results = resultRepository.findByAttemptIdOrderByCreatedDateAsc(attemptId);
        return results.stream()
            .map(QuizResultMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Get quiz statistics for a user
    public Map<String, Object> getUserQuizStatistics(String userId) {
        enforceCanViewUserAttempts(userId);
        
        List<QuizAttempt> completedAttempts = attemptRepository.findByUserIdOrderByCreatedDateDesc(userId)
            .stream()
            .filter(attempt -> attempt.isCompleted())
            .collect(Collectors.toList());
        
        long totalAttempts = completedAttempts.size();
        long passedAttempts = completedAttempts.stream().filter(attempt -> attempt.isPassed()).count();
        double averageScore = completedAttempts.stream()
            .mapToDouble(attempt -> attempt.getPercentageScore() != null ? attempt.getPercentageScore() : 0.0)
            .average()
            .orElse(0.0);
        
        return Map.of(
            "totalAttempts", totalAttempts,
            "passedAttempts", passedAttempts,
            "failedAttempts", totalAttempts - passedAttempts,
            "passRate", totalAttempts > 0 ? (double) passedAttempts / totalAttempts * 100 : 0.0,
            "averageScore", averageScore
        );
    }

    // Get quiz statistics for a specific quiz
    public Map<String, Object> getQuizStatistics(Long quizId) {
        enforceCanViewQuizStatistics();
        
        List<QuizAttempt> completedAttempts = attemptRepository.findByQuizIdOrderByCreatedDateDesc(quizId)
            .stream()
            .filter(attempt -> attempt.isCompleted())
            .collect(Collectors.toList());
        
        long totalAttempts = completedAttempts.size();
        long passedAttempts = completedAttempts.stream().filter(attempt -> attempt.isPassed()).count();
        double averageScore = completedAttempts.stream()
            .mapToDouble(attempt -> attempt.getPercentageScore() != null ? attempt.getPercentageScore() : 0.0)
            .average()
            .orElse(0.0);
        
        double averageTime = completedAttempts.stream()
            .filter(attempt -> attempt.getTimeTakenMinutes() != null)
            .mapToInt(attempt -> attempt.getTimeTakenMinutes())
            .average()
            .orElse(0.0);
        
        return Map.of(
            "totalAttempts", totalAttempts,
            "passedAttempts", passedAttempts,
            "failedAttempts", totalAttempts - passedAttempts,
            "passRate", totalAttempts > 0 ? (double) passedAttempts / totalAttempts * 100 : 0.0,
            "averageScore", averageScore,
            "averageTimeMinutes", averageTime
        );
    }

    // --- Access Control Helpers ---
    private void enforceCanTakeQuiz() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to take quizzes.");
        }
        boolean allowed = auth.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
            a.getAuthority().equals("ROLE_CONTENT_MANAGER") ||
            a.getAuthority().equals("ROLE_COMMUNITY_MEMBER")
        );
        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to take quizzes.");
        }
    }

    private void enforceCanViewUserAttempts(String userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to view quiz attempts.");
        }
        
        String currentUser = auth.getName();
        if (!currentUser.equals(userId)) {
            // Only admins and content managers can view other users' attempts
            boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> 
                a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
            boolean isContentManager = auth.getAuthorities().stream().anyMatch(a -> 
                a.getAuthority().equals("ROLE_CONTENT_MANAGER"));
            
            if (!isAdmin && !isContentManager) {
                throw new AccessDeniedException("You can only view your own quiz attempts.");
            }
        }
    }

    private void enforceCanViewQuizStatistics() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to view quiz statistics.");
        }
        boolean allowed = auth.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
            a.getAuthority().equals("ROLE_CONTENT_MANAGER")
        );
        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to view quiz statistics.");
        }
    }

    private String getCurrentUsernameOrGuest() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return "guest_" + System.currentTimeMillis();
    }
    
    private boolean isGuestUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser");
    }
    
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) 
            ? auth.getName() : "system";
    }

    // Get total attempt count for general statistics
    public long getTotalAttemptCount() {
        return attemptRepository.count();
    }
} 