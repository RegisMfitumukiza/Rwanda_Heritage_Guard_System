package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.UserActivity;
import com.rwandaheritage.heritageguard.repository.UserActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserActivityService {

    private final UserActivityRepository userActivityRepository;

    @Autowired
    public UserActivityService(UserActivityRepository userActivityRepository) {
        this.userActivityRepository = userActivityRepository;
    }

    public List<Map<String, Object>> getRecentActivityFeed(int limit, String type, String role, int timeRangeMinutes) {
        LocalDateTime startTime = LocalDateTime.now().minusMinutes(timeRangeMinutes);
        
        List<UserActivity> activities;
        
        if (type != null && role != null) {
            activities = userActivityRepository.findByTypeAndTimeRange(type, startTime);
            activities = activities.stream()
                    .filter(activity -> activity.getUserRole().equals(role))
                    .limit(limit)
                    .collect(Collectors.toList());
        } else if (type != null) {
            activities = userActivityRepository.findByTypeAndTimeRange(type, startTime);
        } else if (role != null) {
            activities = userActivityRepository.findByRoleAndTimeRange(role, startTime);
        } else {
            activities = userActivityRepository.findRecentActivities(startTime);
        }
        
        return activities.stream()
                .limit(limit)
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getActiveSessions() {
        LocalDateTime startTime = LocalDateTime.now().minusMinutes(30);
        List<UserActivity> loginActivities = userActivityRepository.findActiveSessions(startTime);
        
        return loginActivities.stream()
                .map(this::convertToSessionMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getActivityStatistics(int days) {
        LocalDateTime startTime = LocalDateTime.now().minusDays(days);
        
        Map<String, Object> stats = new HashMap<>();
        
        List<Object[]> typeStats = userActivityRepository.getActivityTypeStats(startTime);
        Map<String, Long> typeCounts = new HashMap<>();
        for (Object[] stat : typeStats) {
            typeCounts.put((String) stat[0], (Long) stat[1]);
        }
        stats.put("activityTypes", typeCounts);
        
        List<Object[]> roleStats = userActivityRepository.getActivityRoleStats(startTime);
        Map<String, Long> roleCounts = new HashMap<>();
        for (Object[] stat : roleStats) {
            roleCounts.put((String) stat[0], (Long) stat[1]);
        }
        stats.put("userRoles", roleCounts);
        
        long totalActivities = userActivityRepository.countByTypeAndTimeRange(null, startTime);
        stats.put("totalActivities", totalActivities);
        
        return stats;
    }

    public Map<String, Object> getUserBehaviorAnalytics(String timeframe) {
        int days = "week".equals(timeframe) ? 7 : "month".equals(timeframe) ? 30 : 7;
        LocalDateTime startTime = LocalDateTime.now().minusDays(days);
        
        Map<String, Object> analytics = new HashMap<>();
        
        List<UserActivity> recentActivities = userActivityRepository.findRecentActivities(startTime);
        Map<String, Long> userActivityCounts = recentActivities.stream()
                .collect(Collectors.groupingBy(UserActivity::getUsername, Collectors.counting()));
        
        List<Map<String, Object>> topUsers = userActivityCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Map<String, Object> user = new HashMap<>();
                    user.put("username", entry.getKey());
                    user.put("activityCount", entry.getValue());
                    return user;
                })
                .collect(Collectors.toList());
        analytics.put("topUsers", topUsers);
        
        return analytics;
    }

    public List<Map<String, Object>> getActivityLogs(String userId, String startDate, String endDate, int limit) {
        LocalDateTime startTime = LocalDateTime.now().minusDays(30);
        LocalDateTime endTime = LocalDateTime.now();
        
        if (startDate != null) {
            try {
                startTime = LocalDateTime.parse(startDate);
            } catch (Exception e) {
                // Keep default start time
            }
        }
        
        final LocalDateTime finalStartTime = startTime;
        final LocalDateTime finalEndTime = endTime;
        
        List<UserActivity> activities;
        if (userId != null) {
            activities = userActivityRepository.findByUserIdAndIsActiveTrueOrderByCreatedDateDesc(Long.valueOf(userId));
            activities = activities.stream()
                    .filter(activity -> activity.getCreatedDate().isAfter(finalStartTime) && activity.getCreatedDate().isBefore(finalEndTime))
                    .limit(limit)
                    .collect(Collectors.toList());
        } else {
            activities = userActivityRepository.findRecentActivities(finalStartTime);
            activities = activities.stream()
                    .filter(activity -> activity.getCreatedDate().isBefore(finalEndTime))
                    .limit(limit)
                    .collect(Collectors.toList());
        }
        
        return activities.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getLatestUpdates(String since) {
        LocalDateTime startTime = LocalDateTime.now().minusMinutes(30);
        
        if (since != null) {
            try {
                startTime = LocalDateTime.parse(since);
            } catch (Exception e) {
                // Keep default start time
            }
        }
        
        List<UserActivity> recentActivities = userActivityRepository.findRecentActivities(startTime);
        
        Map<String, Object> updates = new HashMap<>();
        updates.put("lastUpdate", LocalDateTime.now().toString());
        updates.put("newActivities", recentActivities.size());
        updates.put("recentActivities", recentActivities.stream()
                .limit(10)
                .map(this::convertToMap)
                .collect(Collectors.toList()));
        
        return updates;
    }

    public UserActivity trackActivity(Long userId, String username, String userRole, String activityType, 
                                   String action, String target, String targetType, Long targetId, 
                                   String sessionId, String ipAddress, String userAgent, String priority) {
        
        UserActivity activity = UserActivity.builder()
                .userId(userId)
                .username(username)
                .userRole(userRole)
                .activityType(activityType)
                .action(action)
                .target(target)
                .targetType(targetType)
                .targetId(targetId)
                .sessionId(sessionId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .priority(priority != null ? priority : UserActivity.PRIORITY_LOW)
                .isActive(true)
                .build();
        
        return userActivityRepository.save(activity);
    }

    private Map<String, Object> convertToMap(UserActivity activity) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", activity.getId());
        map.put("type", activity.getActivityType());
        map.put("userId", activity.getUserId());
        map.put("username", activity.getUsername());
        map.put("userRole", activity.getUserRole());
        map.put("action", activity.getAction());
        map.put("target", activity.getTarget());
        map.put("metadata", activity.getMetadata());
        map.put("timestamp", activity.getCreatedDate());
        map.put("sessionId", activity.getSessionId());
        map.put("ipAddress", activity.getIpAddress());
        map.put("userAgent", activity.getUserAgent());
        map.put("priority", activity.getPriority());
        return map;
    }

    private Map<String, Object> convertToSessionMap(UserActivity activity) {
        Map<String, Object> map = new HashMap<>();
        map.put("sessionId", activity.getSessionId());
        map.put("username", activity.getUsername());
        map.put("userRole", activity.getUserRole());
        map.put("loginTime", activity.getCreatedDate());
        map.put("ipAddress", activity.getIpAddress());
        map.put("userAgent", activity.getUserAgent());
        map.put("duration", calculateSessionDuration(activity.getCreatedDate()));
        return map;
    }

    private String calculateSessionDuration(LocalDateTime loginTime) {
        long minutes = java.time.Duration.between(loginTime, LocalDateTime.now()).toMinutes();
        if (minutes < 60) {
            return minutes + "m";
        } else {
            long hours = minutes / 60;
            long remainingMinutes = minutes % 60;
            return hours + "h " + remainingMinutes + "m";
        }
    }
}
