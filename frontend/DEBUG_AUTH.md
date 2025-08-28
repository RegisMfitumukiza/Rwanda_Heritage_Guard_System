# 🔐 Authentication Debug Guide

## 🚨 **CRITICAL ISSUE: Frequent "Access Denied" Errors**

This guide will help you identify and resolve the authentication issues that are causing frequent access denied errors.

## 🔍 **Debug Tools Available**

### 1. **Auth Debug Panel**
- **Location**: Red button "🔐 Debug Auth" in bottom-right corner
- **Features**:
  - Real-time authentication state monitoring
  - Token expiry information
  - Debug logs with timestamps
  - Force token refresh
  - Simulate errors for testing

### 2. **Console Logging**
- All authentication actions are logged with 🔐 emoji
- Check browser console for detailed logs
- Logs are also stored in localStorage under `auth_debug_logs`

### 3. **Browser DevTools**
- **Application Tab**: Check localStorage for tokens
- **Network Tab**: Monitor API requests and responses
- **Console Tab**: View real-time debug logs

## 🧪 **Testing Steps**

### **Step 1: Open Debug Panel**
1. Look for red "🔐 Debug Auth" button in bottom-right corner
2. Click to open the debug panel
3. Observe the current authentication state

### **Step 2: Check Current State**
- **Has Token**: Should show ✅ Yes if logged in
- **Has Refresh Token**: Should show ✅ Yes if logged in
- **User**: Should show username if authenticated
- **Loading**: Should show ❌ No after initial load
- **Token Info**: Check expiry time and status

### **Step 3: Monitor During Access Denied**
1. Keep debug panel open
2. Navigate to a page that shows "Access Denied"
3. Watch the debug logs for what happens
4. Check if tokens are being cleared unexpectedly

### **Step 4: Check Console Logs**
1. Open browser console (F12)
2. Look for logs starting with 🔐
3. Identify the sequence of events leading to access denied

## 🚨 **Common Issues to Look For**

### **Issue 1: Token Expiry**
- **Symptoms**: User gets logged out every few minutes
- **Debug Signs**: Token shows "❌ Expired" in debug panel
- **Solution**: Check if refresh token mechanism is working

### **Issue 2: Network Errors**
- **Symptoms**: Intermittent access denied during poor connection
- **Debug Signs**: Logs show "NETWORK_ERROR" or "Network Error"
- **Solution**: Check internet connection and server availability

### **Issue 3: Race Conditions**
- **Symptoms**: Inconsistent authentication state
- **Debug Signs**: Multiple rapid log entries for same action
- **Solution**: Look for duplicate API calls or conflicting state updates

### **Issue 4: Backend Validation Failures**
- **Symptoms**: Valid token but still access denied
- **Debug Signs**: 401/403 responses from backend APIs
- **Solution**: Check backend authentication logic

## 📊 **Debug Information to Collect**

When reporting issues, collect this information:

### **1. Current Auth State**
```javascript
// In browser console, run:
const { debug } = useAuth();
console.log(debug.getAuthState());
```

### **2. Recent Debug Logs**
```javascript
// Get last 100 debug logs:
const logs = debug.getDebugLogs();
console.table(logs.slice(-10)); // Last 10 logs
```

### **3. Token Information**
```javascript
// Check token details:
const token = localStorage.getItem('token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token Payload:', payload);
    console.log('Expires:', new Date(payload.exp * 1000));
    console.log('Minutes Left:', Math.floor((payload.exp * 1000 - Date.now()) / 60000));
}
```

### **4. Network Requests**
- Check Network tab in DevTools
- Look for failed requests to `/api/users/profile`
- Check response status codes and error messages

## 🔧 **Immediate Actions**

### **If Access Denied Occurs:**
1. **Don't refresh the page** - keep debug panel open
2. **Check debug logs** for what happened
3. **Note the exact time** and sequence of events
4. **Check token state** before and after the error
5. **Look for error patterns** in the logs

### **If Debug Panel Shows Issues:**
1. **Token Expired**: Check if refresh mechanism is working
2. **No User Data**: Check if backend profile API is responding
3. **Network Errors**: Check server connectivity
4. **Race Conditions**: Look for duplicate API calls

## 📝 **Reporting Issues**

When reporting access denied issues, include:

1. **Timestamp** of when it occurred
2. **Page/Route** where it happened
3. **Debug panel state** at the time
4. **Console logs** around the error
5. **Network requests** that failed
6. **Steps to reproduce** the issue

## 🎯 **Expected Behavior**

### **Normal Authentication Flow:**
1. User logs in → Token stored in localStorage
2. Token validated on page load → User state set
3. Token refreshed before expiry → Seamless experience
4. Network errors handled gracefully → No unnecessary logout

### **What Should NOT Happen:**
- ❌ User logged out every few minutes
- ❌ Access denied on valid pages
- ❌ Tokens cleared on network errors
- ❌ Multiple rapid authentication checks

## 🆘 **Emergency Debugging**

If the issue is critical:

1. **Enable verbose logging** in browser console
2. **Monitor network tab** for all API calls
3. **Check localStorage** for token changes
4. **Use debug panel** to force token refresh
5. **Simulate errors** to test error handling

## 🔍 **Next Steps**

1. **Open the debug panel** and observe current state
2. **Navigate through the app** while monitoring logs
3. **Trigger an access denied error** and capture debug info
4. **Share the debug logs** and state information
5. **Identify the root cause** from the collected data

---

**Remember**: The debug panel is your best friend for identifying authentication issues. Keep it open and monitor it while using the application to catch the exact moment when things go wrong.
