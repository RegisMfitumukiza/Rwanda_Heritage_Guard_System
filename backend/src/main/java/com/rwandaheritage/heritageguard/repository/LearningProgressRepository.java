package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.LearningProgress;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    List<LearningProgress> findByUserId(Long userId);
    List<LearningProgress> findByArticleId(Long articleId);
    List<LearningProgress> findByQuizId(Long quizId);
    List<LearningProgress> findByStatus(LearningProgress.ProgressStatus status);
    List<LearningProgress> findTop10ByOrderByLastAccessedDateDesc();
    List<LearningProgress> findByQuizIdNotNullOrderByCompletedDateDesc();
}
