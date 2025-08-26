package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.repository.UserRepository;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import com.rwandaheritage.heritageguard.repository.ArtifactRepository;
import com.rwandaheritage.heritageguard.repository.UserActivityRepository;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.model.Artifact;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final UserRepository userRepository;
    private final HeritageSiteRepository heritageSiteRepository;
    private final ArtifactRepository artifactRepository;
    private final UserActivityRepository userActivityRepository;

    /**
     * Generate comprehensive system report with filters
     */
    @Transactional(readOnly = true)
    public Map<String, Object> generateSystemReport(ReportFilters filters) {
        log.info("Generating system report with filters: {}", filters);
        
        Map<String, Object> report = new HashMap<>();
        report.put("generatedAt", LocalDateTime.now());
        report.put("filters", filters);
        
        // User Analytics
        report.put("userAnalytics", generateUserAnalytics(filters));
        
        // Heritage Site Analytics
        report.put("heritageAnalytics", generateHeritageAnalytics(filters));
        
        // Content Analytics
        report.put("contentAnalytics", generateContentAnalytics(filters));
        
        // System Performance
        report.put("systemPerformance", generateSystemPerformance(filters));
        
        // Security Analytics
        report.put("securityAnalytics", generateSecurityAnalytics(filters));
        
        return report;
    }

    /**
     * Generate user analytics report
     */
    private Map<String, Object> generateUserAnalytics(ReportFilters filters) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Total user counts
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsEnabledTrue();
        long inactiveUsers = totalUsers - activeUsers;
        long lockedUsers = userRepository.findByIsAccountNonLockedFalseAndIsEnabledTrue().size();
        
        analytics.put("totalUsers", totalUsers);
        analytics.put("activeUsers", activeUsers);
        analytics.put("inactiveUsers", inactiveUsers);
        analytics.put("lockedUsers", lockedUsers);
        
        // Role distribution
        Map<String, Long> roleDistribution = new HashMap<>();
        roleDistribution.put("SYSTEM_ADMINISTRATOR", userRepository.countByRoleAndIsEnabledTrue(User.Role.SYSTEM_ADMINISTRATOR));
        roleDistribution.put("HERITAGE_MANAGER", userRepository.countByRoleAndIsEnabledTrue(User.Role.HERITAGE_MANAGER));
        roleDistribution.put("CONTENT_MANAGER", userRepository.countByRoleAndIsEnabledTrue(User.Role.CONTENT_MANAGER));
        roleDistribution.put("COMMUNITY_MEMBER", userRepository.countByRoleAndIsEnabledTrue(User.Role.COMMUNITY_MEMBER));
        analytics.put("roleDistribution", roleDistribution);
        
        // Registration trends (if date filter applied)
        if (filters.getStartDate() != null && filters.getEndDate() != null) {
            List<Map<String, Object>> registrationTrends = generateRegistrationTrends(filters.getStartDate(), filters.getEndDate());
            analytics.put("registrationTrends", registrationTrends);
        }
        
        // User status breakdown
        Map<String, Object> statusBreakdown = new HashMap<>();
        statusBreakdown.put("verified", userRepository.countByEmailVerifiedTrue());
        statusBreakdown.put("unverified", userRepository.count() - userRepository.countByEmailVerifiedTrue());
        statusBreakdown.put("recentlyActive", userRepository.countByCreatedDateAfter(LocalDateTime.now().minusDays(30)));
        analytics.put("statusBreakdown", statusBreakdown);
        
        return analytics;
    }

    /**
     * Generate heritage site analytics report
     */
    private Map<String, Object> generateHeritageAnalytics(ReportFilters filters) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Total site counts
        long totalSites = heritageSiteRepository.count();
        long activeSites = heritageSiteRepository.countByStatusAndIsActiveTrue("ACTIVE");
        long proposedSites = heritageSiteRepository.countByStatusAndIsActiveTrue("PROPOSED");
        long underConservation = heritageSiteRepository.countByStatusAndIsActiveTrue("UNDER_CONSERVATION");
        
        analytics.put("totalSites", totalSites);
        analytics.put("activeSites", activeSites);
        analytics.put("proposedSites", proposedSites);
        analytics.put("underConservation", underConservation);
        
        // Site status distribution
        Map<String, Long> statusDistribution = new HashMap<>();
        statusDistribution.put("ACTIVE", activeSites);
        statusDistribution.put("PROPOSED", proposedSites);
        statusDistribution.put("UNDER_CONSERVATION", underConservation);
        statusDistribution.put("INACTIVE", totalSites - activeSites - proposedSites - underConservation);
        analytics.put("statusDistribution", statusDistribution);
        
        // Manager assignment statistics
        // This would need to be implemented based on your HeritageSiteManager entity
        
        return analytics;
    }

    /**
     * Generate content analytics report
     */
    private Map<String, Object> generateContentAnalytics(ReportFilters filters) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Artifact counts
        long totalArtifacts = artifactRepository.count();
        long authenticatedArtifacts = artifactRepository.countByAuthenticationStatus("AUTHENTICATED");
        long pendingArtifacts = artifactRepository.countByAuthenticationStatus("PENDING");
        
        analytics.put("totalArtifacts", totalArtifacts);
        analytics.put("authenticatedArtifacts", authenticatedArtifacts);
        analytics.put("pendingArtifacts", pendingArtifacts);
        
        // Content type distribution
        Map<String, Long> contentTypeDistribution = new HashMap<>();
        contentTypeDistribution.put("ARTIFACTS", totalArtifacts);
        // Add other content types as needed
        analytics.put("contentTypeDistribution", contentTypeDistribution);
        
        return analytics;
    }

    /**
     * Generate system performance report
     */
    private Map<String, Object> generateSystemPerformance(ReportFilters filters) {
        Map<String, Object> analytics = new HashMap<>();
        
        // User activity metrics
        Map<String, Object> activityMetrics = new HashMap<>();
        activityMetrics.put("totalSessions", 0L); // Would need to implement session tracking
        activityMetrics.put("averageSessionDuration", 0L);
        activityMetrics.put("peakUsageTime", "N/A");
        analytics.put("activityMetrics", activityMetrics);
        
        // API usage statistics
        Map<String, Object> apiUsage = new HashMap<>();
        apiUsage.put("totalRequests", 0L); // Would need to implement request tracking
        apiUsage.put("successRate", 100.0);
        apiUsage.put("averageResponseTime", 0L);
        analytics.put("apiUsage", apiUsage);
        
        return analytics;
    }

    /**
     * Generate security analytics report
     */
    private Map<String, Object> generateSecurityAnalytics(ReportFilters filters) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Account security status
        Map<String, Object> securityStatus = new HashMap<>();
        securityStatus.put("lockedAccounts", userRepository.findByIsAccountNonLockedFalseAndIsEnabledTrue().size());
        securityStatus.put("failedLoginAttempts", 0L); // Would need to implement tracking
        securityStatus.put("suspiciousActivity", 0L);
        analytics.put("securityStatus", securityStatus);
        
        // Recent security events
        List<Map<String, Object>> securityEvents = new ArrayList<>();
        // This would be populated from security event logs
        analytics.put("securityEvents", securityEvents);
        
        return analytics;
    }

    /**
     * Generate registration trends for date range
     */
    private List<Map<String, Object>> generateRegistrationTrends(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> trends = new ArrayList<>();
        
        LocalDate current = startDate;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        while (!current.isAfter(endDate)) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", current.format(formatter));
            
            LocalDateTime dayStart = current.atStartOfDay();
            LocalDateTime dayEnd = current.atTime(23, 59, 59);
            
            long registrations = userRepository.getUserCountByDate(current);
            dayData.put("registrations", registrations);
            
            trends.add(dayData);
            current = current.plusDays(1);
        }
        
        return trends;
    }

    /**
     * Export report to different formats
     */
    public byte[] exportReportToCSV(Map<String, Object> report) {
        // Implementation for CSV export
        StringBuilder csv = new StringBuilder();
        csv.append("Report Generated: ").append(report.get("generatedAt")).append("\n");
        
        // Add report data in CSV format
        // This is a simplified version - you'd want more sophisticated CSV generation
        
        return csv.toString().getBytes();
    }

    /**
     * Report filters class
     */
    public static class ReportFilters {
        private LocalDate startDate;
        private LocalDate endDate;
        private List<String> userRoles;
        private List<String> siteStatuses;
        private List<String> contentTypes;
        private String exportFormat; // CSV, PDF, EXCEL
        
        // Getters and setters
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        
        public List<String> getUserRoles() { return userRoles; }
        public void setUserRoles(List<String> userRoles) { this.userRoles = userRoles; }
        
        public List<String> getSiteStatuses() { return siteStatuses; }
        public void setSiteStatuses(List<String> siteStatuses) { this.siteStatuses = siteStatuses; }
        
        public List<String> getContentTypes() { return contentTypes; }
        public void setContentTypes(List<String> contentTypes) { this.contentTypes = contentTypes; }
        
        public String getExportFormat() { return exportFormat; }
        public void setExportFormat(String exportFormat) { this.exportFormat = exportFormat; }
    }
}

