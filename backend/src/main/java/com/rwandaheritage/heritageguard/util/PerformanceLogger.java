package com.rwandaheritage.heritageguard.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class PerformanceLogger {
    
    public static void logExecutionTime(String methodName, long executionTimeMs) {
        log.debug("Method {} executed in {}ms", methodName, executionTimeMs);
    }
    
    public static void logApiRequest(String endpoint, String method, long executionTimeMs, int statusCode) {
        if (statusCode >= 500 || executionTimeMs > 1000) {
            log.warn("API {} {} - Status: {}, Time: {}ms", method, endpoint, statusCode, executionTimeMs);
        } else {
            log.info("API {} {} - Status: {}, Time: {}ms", method, endpoint, statusCode, executionTimeMs);
        }
    }
}
