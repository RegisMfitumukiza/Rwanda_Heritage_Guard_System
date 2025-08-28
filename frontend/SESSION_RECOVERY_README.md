# Session Recovery Improvements

## Overview
This document describes the improvements made to resolve the frequent "Access Denied" errors that were occurring every few minutes while users were logged in.

## Problem Description
Users were experiencing intermittent "Access Denied" errors due to:
1. **Token refresh failures** during network issues or server problems
2. **Authentication state loss** when tokens couldn't be refreshed
3. **Role validation mismatches** after authentication state was cleared

## Solutions Implemented

### 1. Improved Token Refresh Mechanism
- **Reduced frequency**: Changed token expiry checks from every 30 seconds to every 60 seconds
- **Better error handling**: Only clear tokens on actual authentication failures (401), not on network errors
- **Retry logic**: Added automatic retry mechanisms for failed token refreshes

### 2. Enhanced Error Handling
- **Network error resilience**: Keep tokens during network connectivity issues
- **Temporary user states**: Create temporary user objects from token payloads during network issues
- **Automatic retry**: Schedule retry attempts after 10-15 seconds for failed validations

### 3. Session Recovery Utility
- **Automatic recovery**: Attempts to refresh tokens when 403 errors occur
- **Retry mechanism**: Up to 3 retry attempts with 10-second intervals
- **State management**: Tracks recovery attempts and prevents duplicate recovery operations

### 4. Improved User Experience
- **Session recovery indicator**: Shows when automatic session recovery is in progress
- **Better error messages**: Distinguish between network issues and actual authentication failures
- **Graceful degradation**: Users can continue using the app during temporary network issues

## Files Modified

### Core Authentication
- `frontend/src/contexts/AuthContext.jsx` - Enhanced token refresh and validation logic
- `frontend/src/components/auth/RoleBasedRoute.jsx` - Better handling of temporary authentication states

### Network Layer
- `frontend/src/config/axios.js` - Improved error handling and session recovery integration

### New Components
- `frontend/src/utils/sessionRecovery.js` - Session recovery utility class
- `frontend/src/components/ui/SessionRecoveryIndicator.jsx` - Visual indicator for recovery progress

### App Integration
- `frontend/src/App.jsx` - Added session recovery indicator

## How It Works

### Token Refresh Flow
1. **Proactive checking**: Every 60 seconds, check if token expires within 5 minutes
2. **Automatic refresh**: If expiring soon, attempt to refresh proactively
3. **Error handling**: On failure, keep existing tokens and retry later
4. **State preservation**: Maintain user session during temporary issues

### Session Recovery Flow
1. **Error detection**: When 403 errors occur, trigger session recovery
2. **Token refresh**: Attempt to refresh the access token using refresh token
3. **Request retry**: If successful, retry the original failed request
4. **User feedback**: Show recovery progress indicator

### Temporary State Management
1. **Network issues**: Create temporary user from token payload
2. **Role validation**: Allow access based on temporary state
3. **Background recovery**: Continue attempting to restore full session
4. **Seamless transition**: Switch to full user state when recovery succeeds

## Configuration

### Token Expiry Settings
- **Warning threshold**: 10 minutes before expiry
- **Refresh threshold**: 5 minutes before expiry
- **Check interval**: 60 seconds
- **Retry delays**: 10-15 seconds between attempts

### Recovery Settings
- **Max retries**: 3 attempts
- **Retry delay**: 10 seconds between attempts
- **Auto-retry**: Enabled for network and server errors

## Troubleshooting

### If Access Denied Still Occurs

1. **Check browser console** for error messages
2. **Verify network connectivity** to the backend server
3. **Check token expiry** in browser storage
4. **Look for session recovery indicators** in the top-right corner

### Common Issues

#### Network Connectivity
- **Problem**: Intermittent network issues causing token refresh failures
- **Solution**: The system now preserves tokens during network issues and retries automatically

#### Server Errors
- **Problem**: Backend server returning 500 errors during token validation
- **Solution**: Tokens are preserved and retry attempts are scheduled

#### Token Expiry
- **Problem**: Tokens expiring without successful refresh
- **Solution**: Proactive refresh 5 minutes before expiry with fallback mechanisms

### Debug Information

Enable debug logging by checking the browser console for:
- Token refresh attempts and results
- Session recovery progress
- Error details and retry schedules
- Temporary user state creation

## Performance Impact

- **Minimal overhead**: Token checks reduced from 30s to 60s intervals
- **Efficient recovery**: Only attempts recovery when necessary
- **State preservation**: Prevents unnecessary re-authentication
- **User experience**: Seamless operation during temporary issues

## Future Improvements

1. **Exponential backoff** for retry attempts
2. **User notification** when manual re-authentication is required
3. **Offline mode support** with token-based access
4. **Metrics collection** for recovery success rates

## Support

If you continue to experience issues:
1. Check the browser console for detailed error logs
2. Verify your network connection to the backend
3. Check if the backend server is running and accessible
4. Contact system administrators with specific error messages
