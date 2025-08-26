package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.SiteStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SiteStatusHistoryRepository extends JpaRepository<SiteStatusHistory, Long> {
    List<SiteStatusHistory> findBySiteIdOrderByChangedAtDesc(Long siteId);
}
