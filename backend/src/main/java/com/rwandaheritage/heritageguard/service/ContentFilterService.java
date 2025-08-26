package com.rwandaheritage.heritageguard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentFilterService {
    
    // Inappropriate words/phrases (simplified for demo)
    private static final Set<String> INAPPROPRIATE_WORDS = new HashSet<>(Arrays.asList(
        "spam", "advertisement", "commercial", "buy now", "click here", "free money",
        "lottery", "winner", "urgent", "limited time", "act now", "guaranteed", "suspicious"
    ));
    
    // Hate speech patterns (simplified for demo)
    private static final List<Pattern> HATE_SPEECH_PATTERNS = Arrays.asList(
        Pattern.compile("\\b(kill|hate|destroy)\\s+(all|every)\\s+\\w+", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(racist|sexist|homophobic)\\s+\\w+", Pattern.CASE_INSENSITIVE)
    );
    
    // Spam patterns
    private static final List<Pattern> SPAM_PATTERNS = Arrays.asList(
        Pattern.compile("\\b(www\\.|http://|https://)\\S+", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(\\w+@\\w+\\.\\w+)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(\\d{3}-\\d{3}-\\d{4}|\\d{10})\\b") // Phone numbers
    );
    
    /**
     * Analyze content for inappropriate content
     */
    public ContentAnalysisResult analyzeContent(String content) {
        log.debug("Analyzing content: {}", content);
        
        if (content == null || content.trim().isEmpty()) {
            return ContentAnalysisResult.builder()
                    .isAppropriate(true)
                    .confidenceScore(1.0)
                    .build();
        }
        
        String lowerContent = content.toLowerCase();
        List<String> flags = new ArrayList<>();
        double confidenceScore = 1.0;
        
        // Check for inappropriate words
        for (String word : INAPPROPRIATE_WORDS) {
            if (lowerContent.contains(word.toLowerCase())) {
                flags.add("Contains inappropriate word: " + word);
                confidenceScore -= 0.1;
                log.debug("Found inappropriate word: {}", word);
            }
        }
        
        // Check for hate speech patterns
        for (Pattern pattern : HATE_SPEECH_PATTERNS) {
            if (pattern.matcher(content).find()) {
                flags.add("Potential hate speech detected");
                confidenceScore -= 0.3;
                log.debug("Found hate speech pattern");
            }
        }
        
        // Check for spam patterns
        int spamPatternCount = 0;
        for (Pattern pattern : SPAM_PATTERNS) {
            if (pattern.matcher(content).find()) {
                spamPatternCount++;
                log.debug("Found spam pattern");
            }
        }
        
        if (spamPatternCount > 2) {
            flags.add("Multiple spam indicators detected");
            confidenceScore -= 0.2;
        }
        
        // Check for excessive repetition
        if (hasExcessiveRepetition(content)) {
            flags.add("Excessive repetition detected");
            confidenceScore -= 0.15;
            log.debug("Found excessive repetition");
        }
        
        // Check for excessive capitalization
        if (hasExcessiveCapitalization(content)) {
            flags.add("Excessive capitalization detected");
            confidenceScore -= 0.1;
            log.debug("Found excessive capitalization");
        }
        
        // Ensure confidence score is between 0 and 1
        confidenceScore = Math.max(0.0, Math.min(1.0, confidenceScore));
        
        boolean isAppropriate = confidenceScore >= 0.7;
        
        log.debug("Content analysis result - confidence: {}, appropriate: {}, flags: {}", 
                 confidenceScore, isAppropriate, flags);
        
        return ContentAnalysisResult.builder()
                .isAppropriate(isAppropriate)
                .confidenceScore(confidenceScore)
                .flags(flags)
                .build();
    }
    
    /**
     * Check for excessive repetition in content
     */
    private boolean hasExcessiveRepetition(String content) {
        String[] words = content.toLowerCase().split("\\s+");
        Map<String, Integer> wordCount = new HashMap<>();
        
        for (String word : words) {
            if (word.length() > 3) { // Only count words longer than 3 characters
                wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
            }
        }
        
        // Check if any word appears more than 3 times in a short text
        return wordCount.values().stream().anyMatch(count -> count > 3);
    }
    
    /**
     * Check for excessive capitalization
     */
    private boolean hasExcessiveCapitalization(String content) {
        if (content.length() < 10) return false;
        
        int upperCaseCount = 0;
        int totalLetters = 0;
        
        for (char c : content.toCharArray()) {
            if (Character.isLetter(c)) {
                totalLetters++;
                if (Character.isUpperCase(c)) {
                    upperCaseCount++;
                }
            }
        }
        
        if (totalLetters == 0) return false;
        
        double upperCaseRatio = (double) upperCaseCount / totalLetters;
        return upperCaseRatio > 0.5; // More than 50% uppercase
    }
    
    /**
     * Get content analysis result with moderation recommendation
     */
    public ModerationRecommendation getModerationRecommendation(String content) {
        ContentAnalysisResult analysis = analyzeContent(content);
        
        ModerationAction recommendedAction;
        String reason;
        
        if (analysis.getConfidenceScore() >= 0.9) {
            recommendedAction = ModerationAction.APPROVE;
            reason = "Content appears appropriate";
        } else if (analysis.getConfidenceScore() >= 0.7) {
            recommendedAction = ModerationAction.FLAG;
            reason = "Content may need review: " + String.join(", ", analysis.getFlags());
        } else {
            recommendedAction = ModerationAction.REJECT;
            reason = "Content likely inappropriate: " + String.join(", ", analysis.getFlags());
        }
        
        return ModerationRecommendation.builder()
                .action(recommendedAction)
                .reason(reason)
                .confidenceScore(analysis.getConfidenceScore())
                .flags(analysis.getFlags())
                .build();
    }
    
    // Inner classes for results
    @lombok.Data
    @lombok.Builder
    public static class ContentAnalysisResult {
        private boolean isAppropriate;
        private double confidenceScore;
        private List<String> flags;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class ModerationRecommendation {
        private ModerationAction action;
        private String reason;
        private double confidenceScore;
        private List<String> flags;
    }
    
    public enum ModerationAction {
        APPROVE, FLAG, REJECT
    }
}