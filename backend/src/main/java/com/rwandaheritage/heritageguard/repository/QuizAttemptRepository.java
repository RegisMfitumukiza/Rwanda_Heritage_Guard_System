package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    List<QuizAttempt> findByUserIdOrderByCreatedDateDesc(String userId);
    
    List<QuizAttempt> findByQuizIdAndUserIdOrderByCreatedDateDesc(Long quizId, String userId);
    
    List<QuizAttempt> findByQuizIdAndUserIdAndIsCompletedTrueOrderByCreatedDateDesc(Long quizId, String userId);
    
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quizId = :quizId AND qa.userId = :userId")
    Long countAttemptsByQuizAndUser(@Param("quizId") Long quizId, @Param("userId") String userId);
    
    @Query("SELECT MAX(qa.attemptNumber) FROM QuizAttempt qa WHERE qa.quizId = :quizId AND qa.userId = :userId")
    Integer findMaxAttemptNumberByQuizAndUser(@Param("quizId") Long quizId, @Param("userId") String userId);
    
    List<QuizAttempt> findByQuizIdOrderByCreatedDateDesc(Long quizId);
} 