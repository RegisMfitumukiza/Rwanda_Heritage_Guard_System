package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    
    List<QuizResult> findByAttemptIdOrderByCreatedDateAsc(Long attemptId);
    
    List<QuizResult> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
    
    List<QuizResult> findByQuestionId(Long questionId);
} 