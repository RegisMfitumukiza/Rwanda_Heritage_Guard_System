package com.rwandaheritage.heritageguard.exception;

/**
 * Custom exception for business logic violations
 */
public class BusinessLogicException extends RuntimeException {
    
    private final String errorCode;
    private final String businessRule;
    
    public BusinessLogicException(String message, String errorCode, String businessRule) {
        super(message);
        this.errorCode = errorCode;
        this.businessRule = businessRule;
    }
    
    public BusinessLogicException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.businessRule = null;
    }
    
    public BusinessLogicException(String message) {
        super(message);
        this.errorCode = "BUS_001";
        this.businessRule = null;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public String getBusinessRule() {
        return businessRule;
    }
}

