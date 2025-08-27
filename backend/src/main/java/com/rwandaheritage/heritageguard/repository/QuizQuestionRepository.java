package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    
    List<QuizQuestion> findByQuizIdAndIsActiveTrueOrderByQuestionOrderAsc(Long quizId);
    
    List<QuizQuestion> findByQuizIdAndIsActiveTrue(Long quizId);

    List<QuizQuestion> findByQuizId(Long quizId);

    QuizQuestion findTopByQuizIdOrderByQuestionOrderDesc(Long quizId);
}