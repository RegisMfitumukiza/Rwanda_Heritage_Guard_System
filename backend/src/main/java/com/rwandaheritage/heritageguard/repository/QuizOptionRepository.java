package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {
    
    List<QuizOption> findByQuestionIdAndIsActiveTrueOrderByOptionOrderAsc(Long questionId);
    
    List<QuizOption> findByQuestionIdAndIsActiveTrue(Long questionId);
    
    List<QuizOption> findByQuestionId(Long questionId);

    List<QuizOption> findByQuestionIdAndIsCorrectTrue(Long questionId);

    QuizOption findTopByQuestionIdOrderByOptionOrderDesc(Long questionId);
}