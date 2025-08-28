package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.*;
import com.rwandaheritage.heritageguard.mapper.*;
import com.rwandaheritage.heritageguard.model.*;
import com.rwandaheritage.heritageguard.repository.*;
import com.rwandaheritage.heritageguard.service.MultilingualIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {
    
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final EducationalArticleRepository articleRepository;
    private final MultilingualIntegrationService multilingualService;

    @Autowired
    public QuizService(QuizRepository quizRepository, 
                      QuizQuestionRepository questionRepository,
                      QuizOptionRepository optionRepository,
                      EducationalArticleRepository articleRepository,
                      MultilingualIntegrationService multilingualService) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.articleRepository = articleRepository;
        this.multilingualService = multilingualService;
    }

    // Create a new quiz
    public QuizDTO createQuiz(QuizDTO quizDTO) {
        enforceCanCreate();
        
        // Validate article exists
        if (!articleRepository.existsById(quizDTO.getArticleId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Educational article not found");
        }
        
        Quiz quiz = QuizMapper.toEntity(quizDTO);
        
        // Set audit fields
        String createdBy = getCurrentUsername();
        quiz.setCreatedBy(createdBy);
        quiz.setCreatedDate(LocalDateTime.now());
        
        Quiz savedQuiz = quizRepository.save(quiz);
        return QuizMapper.toDTO(savedQuiz);
    }

    @Transactional
    public QuizCreationDTO createQuizWithQuestions(QuizCreationDTO creationDTO) {
        enforceCanCreate();

        QuizDTO quizDTO = creationDTO.getQuiz();

        if (!articleRepository.existsById(quizDTO.getArticleId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Educational article not found");
        }

        Quiz quiz = QuizMapper.toEntity(quizDTO);

        String createdBy = getCurrentUsername();
        quiz.setCreatedBy(createdBy);
        quiz.setCreatedDate(LocalDateTime.now());

        Quiz savedQuiz = quizRepository.save(quiz);

        List<QuizQuestionDTO> questionDTOs = new ArrayList<>();
        int qOrder = 1;
        if (creationDTO.getQuestions() != null) {
            for (QuizQuestionDTO qDTO : creationDTO.getQuestions()) {
                qDTO.setQuizId(savedQuiz.getId());
                qDTO.setQuestionOrder(qOrder++);
                QuizQuestion question = QuizQuestionMapper.toEntity(qDTO);
                question.setCreatedBy(createdBy);
                question.setCreatedDate(LocalDateTime.now());
                QuizQuestion savedQuestion = questionRepository.save(question);

                List<QuizOption> savedOptionEntities = new ArrayList<>();
                int oOrder = 1;
                if (qDTO.getOptions() != null) {
                    for (QuizOptionDTO oDTO : qDTO.getOptions()) {
                        oDTO.setQuestionId(savedQuestion.getId());
                        oDTO.setOptionOrder(oOrder++);
                        QuizOption option = QuizOptionMapper.toEntity(oDTO);
                        option.setCreatedBy(createdBy);
                        option.setCreatedDate(LocalDateTime.now());
                        savedOptionEntities.add(optionRepository.save(option));
                    }
                }

                questionDTOs.add(QuizQuestionMapper.toDTO(savedQuestion, savedOptionEntities));
            }
        }

        return QuizCreationDTO.builder()
                .quiz(QuizMapper.toDTO(savedQuiz))
                .questions(questionDTOs)
                .build();
    }

    // Get quiz by ID
    public QuizDTO getQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        
        if (!canView(quiz)) {
            throw new AccessDeniedException("You do not have permission to view this quiz.");
        }
        
        return QuizMapper.toDTO(quiz);
    }

    // List all quizzes (with filtering based on user role)
    public List<QuizDTO> listQuizzes() {
        List<Quiz> quizzes;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            // Authenticated users can see all active quizzes
            quizzes = quizRepository.findByIsActiveTrue();
        } else {
            // Public users can only see public quizzes
            quizzes = quizRepository.findByIsActiveTrueAndIsPublicTrue();
        }
        
        return quizzes.stream()
            .map(QuizMapper::toDTO)
            .collect(Collectors.toList());
    }

    // List quizzes by article
    public List<QuizDTO> listQuizzesByArticle(Long articleId) {
        List<Quiz> quizzes = quizRepository.findByArticleIdAndIsActiveTrueAndIsPublicTrue(articleId);
        return quizzes.stream()
            .map(QuizMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Search quizzes
    public List<QuizDTO> searchQuizzes(String searchTerm) {
        List<Quiz> quizzes = quizRepository.searchQuizzes(searchTerm);
        return quizzes.stream()
            .map(QuizMapper::toDTO)
            .collect(Collectors.toList());
    }
    
    // Get quizzes by tag
    public List<QuizDTO> getQuizzesByTag(String tag) {
        List<Quiz> quizzes = quizRepository.findByTag(tag);
        return quizzes.stream()
            .map(QuizMapper::toDTO)
            .collect(Collectors.toList());
    }
    
    // Get all quizzes with tags
    public List<QuizDTO> getQuizzesWithTags() {
        List<Quiz> quizzes = quizRepository.findAllWithTags();
        return quizzes.stream()
            .map(QuizMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Update quiz
    public QuizDTO updateQuiz(Long id, QuizDTO quizDTO) {
        Quiz existingQuiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        
        enforceCanEdit(existingQuiz);
        
        // Validate article exists
        if (!articleRepository.existsById(quizDTO.getArticleId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Educational article not found");
        }
        
        // Update fields
        existingQuiz.setTitleEn(quizDTO.getTitleEn());
        existingQuiz.setTitleRw(quizDTO.getTitleRw());
        existingQuiz.setTitleFr(quizDTO.getTitleFr());
        existingQuiz.setDescriptionEn(quizDTO.getDescriptionEn());
        existingQuiz.setDescriptionRw(quizDTO.getDescriptionRw());
        existingQuiz.setDescriptionFr(quizDTO.getDescriptionFr());
        existingQuiz.setArticleId(quizDTO.getArticleId());
        existingQuiz.setPassingScorePercentage(quizDTO.getPassingScorePercentage());
        existingQuiz.setTimeLimitMinutes(quizDTO.getTimeLimitMinutes());
        existingQuiz.setMaxAttempts(quizDTO.getMaxAttempts());
        existingQuiz.setIsPublic(quizDTO.getIsPublic());
        existingQuiz.setIsActive(quizDTO.getIsActive());
        
        // Update audit fields
        String updatedBy = getCurrentUsername();
        existingQuiz.setUpdatedBy(updatedBy);
        existingQuiz.setUpdatedDate(LocalDateTime.now());
        
        Quiz savedQuiz = quizRepository.save(existingQuiz);
        return QuizMapper.toDTO(savedQuiz);
    }

    // Delete quiz (soft delete)
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        
        enforceCanEdit(quiz);
        
        // Soft delete
        quiz.setIsActive(false);
        quiz.setUpdatedBy(getCurrentUsername());
        quiz.setUpdatedDate(LocalDateTime.now());
        
        quizRepository.save(quiz);
    }

    // Create a question for a quiz
    public QuizQuestionDTO createQuestion(QuizQuestionDTO questionDTO) {
        enforceCanCreate();
        
        // Validate quiz exists
        if (!quizRepository.existsById(questionDTO.getQuizId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz not found");
        }

        // Apply defaults
        if (questionDTO.getQuestionType() == null) {
            questionDTO.setQuestionType(QuizQuestion.QuestionType.MULTIPLE_CHOICE.name());
        }
        if (questionDTO.getQuestionOrder() == null) {
            QuizQuestion last = questionRepository.findTopByQuizIdOrderByQuestionOrderDesc(questionDTO.getQuizId());
            int nextOrder = (last != null && last.getQuestionOrder() != null) ? last.getQuestionOrder() + 1 : 1;
            questionDTO.setQuestionOrder(nextOrder);
        }

        QuizQuestion question = QuizQuestionMapper.toEntity(questionDTO);

        // Set audit fields
        String createdBy = getCurrentUsername();
        question.setCreatedBy(createdBy);
        question.setCreatedDate(LocalDateTime.now());

        QuizQuestion savedQuestion = questionRepository.save(question);
        QuizQuestionDTO result = QuizQuestionMapper.toDTO(savedQuestion);

        if (questionDTO.getOptions() != null && !questionDTO.getOptions().isEmpty()) {
            for (QuizOptionDTO optionDTO : questionDTO.getOptions()) {
                optionDTO.setQuestionId(savedQuestion.getId());
                createOption(optionDTO);
            }
            List<QuizOption> savedOptions = optionRepository.findByQuestionIdAndIsActiveTrueOrderByOptionOrderAsc(savedQuestion.getId());
            result.setOptions(savedOptions.stream().map(QuizOptionMapper::toDTO).collect(Collectors.toList()));
        }

        return result;
    }

    // Get question by ID
    public QuizQuestionDTO getQuestion(Long id) {
        QuizQuestion question = questionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        
        return QuizQuestionMapper.toDTO(question);
    }

    // List questions for a quiz
    public List<QuizQuestionDTO> listQuestionsByQuiz(Long quizId) {
        List<QuizQuestion> questions = questionRepository.findByQuizIdAndIsActiveTrueOrderByQuestionOrderAsc(quizId);
        return questions.stream()
            .map(QuizQuestionMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Update question
    public QuizQuestionDTO updateQuestion(Long id, QuizQuestionDTO questionDTO) {
        QuizQuestion existingQuestion = questionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        
        enforceCanEdit();
        
        // Update fields
        existingQuestion.setQuestionTextEn(questionDTO.getQuestionTextEn());
        existingQuestion.setQuestionTextRw(questionDTO.getQuestionTextRw());
        existingQuestion.setQuestionTextFr(questionDTO.getQuestionTextFr());
        existingQuestion.setExplanationEn(questionDTO.getExplanationEn());
        existingQuestion.setExplanationRw(questionDTO.getExplanationRw());
        existingQuestion.setExplanationFr(questionDTO.getExplanationFr());
        existingQuestion.setQuestionType(questionDTO.getQuestionType() != null ? QuizQuestion.QuestionType.valueOf(questionDTO.getQuestionType()) : null);
        existingQuestion.setPoints(questionDTO.getPoints());
        existingQuestion.setQuestionOrder(questionDTO.getQuestionOrder());
        existingQuestion.setIsActive(questionDTO.getIsActive());
        
        // Update audit fields
        String updatedBy = getCurrentUsername();
        existingQuestion.setUpdatedBy(updatedBy);
        existingQuestion.setUpdatedDate(LocalDateTime.now());
        
        QuizQuestion savedQuestion = questionRepository.save(existingQuestion);
        return QuizQuestionMapper.toDTO(savedQuestion);
    }

    // Delete question (soft delete)
    public void deleteQuestion(Long id) {
        QuizQuestion question = questionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        
        enforceCanEdit();
        
        // Soft delete
        question.setIsActive(false);
        question.setUpdatedBy(getCurrentUsername());
        question.setUpdatedDate(LocalDateTime.now());
        
        questionRepository.save(question);
    }

    // Create an option for a question
    public QuizOptionDTO createOption(QuizOptionDTO optionDTO) {
        enforceCanCreate();
        
        // Validate question exists
        if (!questionRepository.existsById(optionDTO.getQuestionId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question not found");
        }

        if (optionDTO.getOptionOrder() == null) {
            QuizOption last = optionRepository.findTopByQuestionIdOrderByOptionOrderDesc(optionDTO.getQuestionId());
            int nextOrder = (last != null && last.getOptionOrder() != null) ? last.getOptionOrder() + 1 : 1;
            optionDTO.setOptionOrder(nextOrder);
        }

        QuizOption option = QuizOptionMapper.toEntity(optionDTO);

        // Set audit fields
        String createdBy = getCurrentUsername();
        option.setCreatedBy(createdBy);
        option.setCreatedDate(LocalDateTime.now());

        QuizOption savedOption = optionRepository.save(option);
        return QuizOptionMapper.toDTO(savedOption);
    }

    // Get option by ID
    public QuizOptionDTO getOption(Long id) {
        QuizOption option = optionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Option not found"));
        
        return QuizOptionMapper.toDTO(option);
    }

    // List options for a question
    public List<QuizOptionDTO> listOptionsByQuestion(Long questionId) {
        List<QuizOption> options = optionRepository.findByQuestionIdAndIsActiveTrueOrderByOptionOrderAsc(questionId);
        return options.stream()
            .map(QuizOptionMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Update option
    public QuizOptionDTO updateOption(Long id, QuizOptionDTO optionDTO) {
        QuizOption existingOption = optionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Option not found"));
        
        enforceCanEdit();
        
        // Update fields
        existingOption.setOptionTextEn(optionDTO.getOptionTextEn());
        existingOption.setOptionTextRw(optionDTO.getOptionTextRw());
        existingOption.setOptionTextFr(optionDTO.getOptionTextFr());
        existingOption.setCorrect(optionDTO.getIsCorrect());
        existingOption.setOptionOrder(optionDTO.getOptionOrder());
        existingOption.setActive(optionDTO.getIsActive());
        
        // Update audit fields
        String updatedBy = getCurrentUsername();
        existingOption.setUpdatedBy(updatedBy);
        existingOption.setUpdatedDate(LocalDateTime.now());
        
        QuizOption savedOption = optionRepository.save(existingOption);
        return QuizOptionMapper.toDTO(savedOption);
    }

    // Delete option (soft delete)
    public void deleteOption(Long id) {
        QuizOption option = optionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Option not found"));
        
        enforceCanEdit();
        
        // Soft delete
        option.setActive(false);
        option.setUpdatedBy(getCurrentUsername());
        option.setUpdatedDate(LocalDateTime.now());
        
        optionRepository.save(option);
    }

    // ===== MULTILINGUAL METHODS =====

    // Get quiz in specific language
    public QuizDTO getQuizInLanguage(Long id, String languageCode) {
        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        
        if (!canView(quiz)) {
            throw new AccessDeniedException("You do not have permission to view this quiz.");
        }
        
        QuizDTO dto = QuizMapper.toDTO(quiz);
        
        // Apply language-specific content
        dto.setTitleEn(multilingualService.getContentInLanguage("QUIZ", id, "title", languageCode, quiz.getTitleEn()));
        dto.setTitleRw(multilingualService.getContentInLanguage("QUIZ", id, "title", "rw", quiz.getTitleRw()));
        dto.setTitleFr(multilingualService.getContentInLanguage("QUIZ", id, "title", "fr", quiz.getTitleFr()));
        
        dto.setDescriptionEn(multilingualService.getContentInLanguage("QUIZ", id, "description", languageCode, quiz.getDescriptionEn()));
        dto.setDescriptionRw(multilingualService.getContentInLanguage("QUIZ", id, "description", "rw", quiz.getDescriptionRw()));
        dto.setDescriptionFr(multilingualService.getContentInLanguage("QUIZ", id, "description", "fr", quiz.getDescriptionFr()));
        
        return dto;
    }

    // Get quiz for specific user (using user's preferred language)
    public QuizDTO getQuizForUser(Long id, User user) {
        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        
        if (!canView(quiz)) {
            throw new AccessDeniedException("You do not have permission to view this quiz.");
        }
        
        QuizDTO dto = QuizMapper.toDTO(quiz);
        
        // Apply user's preferred language content
        dto.setTitleEn(multilingualService.getContentInUserLanguage("QUIZ", id, "title", user, quiz.getTitleEn()));
        dto.setDescriptionEn(multilingualService.getContentInUserLanguage("QUIZ", id, "description", user, quiz.getDescriptionEn()));
        
        return dto;
    }

    // List quizzes in specific language
    public List<QuizDTO> listQuizzesInLanguage(String languageCode) {
        List<Quiz> quizzes;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            quizzes = quizRepository.findByIsActiveTrue();
        } else {
            quizzes = quizRepository.findByIsActiveTrueAndIsPublicTrue();
        }
        
        return quizzes.stream()
            .map(quiz -> {
                QuizDTO dto = QuizMapper.toDTO(quiz);
                
                // Apply language-specific content
                dto.setTitleEn(multilingualService.getContentInLanguage("QUIZ", quiz.getId(), "title", languageCode, quiz.getTitleEn()));
                dto.setDescriptionEn(multilingualService.getContentInLanguage("QUIZ", quiz.getId(), "description", languageCode, quiz.getDescriptionEn()));
                
                return dto;
            })
            .collect(Collectors.toList());
    }

    // List quizzes for specific user (using user's preferred language)
    public List<QuizDTO> listQuizzesForUser(User user) {
        List<Quiz> quizzes;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            quizzes = quizRepository.findByIsActiveTrue();
        } else {
            quizzes = quizRepository.findByIsActiveTrueAndIsPublicTrue();
        }
        
        return quizzes.stream()
            .map(quiz -> {
                QuizDTO dto = QuizMapper.toDTO(quiz);
                
                // Apply user's preferred language content
                dto.setTitleEn(multilingualService.getContentInUserLanguage("QUIZ", quiz.getId(), "title", user, quiz.getTitleEn()));
                dto.setDescriptionEn(multilingualService.getContentInUserLanguage("QUIZ", quiz.getId(), "description", user, quiz.getDescriptionEn()));
                
                return dto;
            })
            .collect(Collectors.toList());
    }

    // Get question in specific language
    public QuizQuestionDTO getQuestionInLanguage(Long id, String languageCode) {
        QuizQuestion question = questionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        
        QuizQuestionDTO dto = QuizQuestionMapper.toDTO(question);
        
        // Apply language-specific content
        dto.setQuestionTextEn(multilingualService.getContentInLanguage("QUIZ_QUESTION", id, "questionText", languageCode, question.getQuestionTextEn()));
        dto.setQuestionTextRw(multilingualService.getContentInLanguage("QUIZ_QUESTION", id, "questionText", "rw", question.getQuestionTextRw()));
        dto.setQuestionTextFr(multilingualService.getContentInLanguage("QUIZ_QUESTION", id, "questionText", "fr", question.getQuestionTextFr()));
        
        dto.setExplanationEn(multilingualService.getContentInLanguage("QUIZ_QUESTION", id, "explanation", languageCode, question.getExplanationEn()));
        dto.setExplanationRw(multilingualService.getContentInLanguage("QUIZ_QUESTION", id, "explanation", "rw", question.getExplanationRw()));
        dto.setExplanationFr(multilingualService.getContentInLanguage("QUIZ_QUESTION", id, "explanation", "fr", question.getExplanationFr()));
        
        return dto;
    }

    // Get option in specific language
    public QuizOptionDTO getOptionInLanguage(Long id, String languageCode) {
        QuizOption option = optionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Option not found"));
        
        QuizOptionDTO dto = QuizOptionMapper.toDTO(option);
        
        // Apply language-specific content
        dto.setOptionTextEn(multilingualService.getContentInLanguage("QUIZ_OPTION", id, "optionText", languageCode, option.getOptionTextEn()));
        dto.setOptionTextRw(multilingualService.getContentInLanguage("QUIZ_OPTION", id, "optionText", "rw", option.getOptionTextRw()));
        dto.setOptionTextFr(multilingualService.getContentInLanguage("QUIZ_OPTION", id, "optionText", "fr", option.getOptionTextFr()));
        
        return dto;
    }

    // --- Access Control Helpers ---
    private void enforceCanCreate() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to create quizzes.");
        }
        boolean allowed = auth.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
            a.getAuthority().equals("ROLE_CONTENT_MANAGER")
        );
        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to create quizzes.");
        }
    }

    private void enforceCanEdit() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to modify quizzes.");
        }
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        boolean isContentManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CONTENT_MANAGER"));
        
        if (!isAdmin && !isContentManager) {
            throw new AccessDeniedException("You do not have permission to modify quizzes.");
        }
    }

    private void enforceCanEdit(Quiz quiz) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to modify quizzes.");
        }
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        boolean isContentManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CONTENT_MANAGER"));
        
        if (!isAdmin && !isContentManager) {
            throw new AccessDeniedException("You do not have permission to modify quizzes.");
        }
    }

    private boolean canView(Quiz quiz) {
        if (quiz.isPublic() && quiz.isActive()) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_SYSTEM_ADMINISTRATOR") || role.equals("ROLE_CONTENT_MANAGER") ||
                role.equals("ROLE_COMMUNITY_MEMBER")) {
                return true;
            }
        }
        return false;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) 
            ? auth.getName() : "system";
    }

    // --- Statistics Methods ---
    
    public long getTotalQuizCount() {
        return quizRepository.count();
    }
    
    public long getPublicQuizCount() {
        return quizRepository.countByIsPublicTrueAndIsActiveTrue();
    }
    
    public long getTotalQuestionCount() {
        return questionRepository.count();
    }
} 