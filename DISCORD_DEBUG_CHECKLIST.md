# Discord Notifications Troubleshooting Checklist

## 🔍 **Current Status:**
- ✅ Discord webhook URL is valid and working (tested directly)
- ✅ Backend is responding and healthy  
- ✅ Environment variables are added to both Render and Vercel
- ✅ Code changes are committed and pushed
- 🔄 Backend redeploying with enhanced logging

## 📋 **Next Steps to Debug:**

### **1. Wait for Render Redeploy (2-3 minutes)**
Your backend is redeploying with enhanced logging. Wait for it to complete.

### **2. Test User Registration Again**
```bash
curl -X POST "https://journeyai-backend.onrender.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "debug-test-'$(date +%s)'@example.com",
    "password": "TestPassword123",
    "firstName": "Debug",
    "lastName": "User",
    "location": "Test Location"
  }'
```

### **3. Check Render Logs Immediately After**
1. Go to [Render Dashboard](https://render.com/dashboard)
2. Click on your backend service
3. Go to "Logs" tab
4. Look for these messages:
   - `👋 New user registered:`
   - `📤 Attempting to send Discord signup notification...`
   - `🔍 Discord service called:`
   - `✅ Discord notification sent successfully`

### **4. Test Website Visit**
```bash
curl -s "https://journeyai-backend.onrender.com/" \
  -H "User-Agent: Debug-Test-Browser"
```

Look for:
- `🌍 Website visitor detected:`
- Discord notification logs

### **5. Test Itinerary Generation**
Use your frontend to generate a trip and check logs for:
- `✈️ Trip generated, sending Discord notification...`
- Discord service logs

## 🎯 **Most Likely Issues:**

### **Issue 1: Environment Variable Not Set on Render**
**Symptoms:** Logs show `❌ Discord webhook URL not configured`
**Solution:** Double-check Render environment variables

### **Issue 2: Fetch API Not Available**
**Symptoms:** Logs show `fetch is not defined` 
**Solution:** Already handled with node-fetch in dependencies

### **Issue 3: CORS or Network Issues**
**Symptoms:** Network errors in logs
**Solution:** Check Render network settings

### **Issue 4: Discord Rate Limiting**
**Symptoms:** 429 status codes in logs
**Solution:** Wait and retry, implement rate limiting

## 🔧 **Environment Variable Double-Check:**

### **Render Backend Environment Variables:**
Go to Render → Your Service → Environment → Add:
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1405730984837513257/6GBgE3bfHDv-vlROLrLdpDCJ8_PDw3PyQMbEYPN7Pfx-rMowgCQp5ypp3pZhqMZ7TFQz
```

### **Common Mistakes:**
- ❌ Extra spaces in the URL
- ❌ Missing `https://` prefix
- ❌ Incorrect webhook ID or token
- ❌ Environment variable name typo: should be `DISCORD_WEBHOOK_URL`

## 🧪 **Debug Commands:**

After redeployment completes, run these:

```bash
# Test 1: Basic connectivity
curl -s "https://journeyai-backend.onrender.com/"

# Test 2: Environment check (when debug route is live)
curl -s "https://journeyai-backend.onrender.com/api/debug/env-check"

# Test 3: User registration with Discord notification
curl -X POST "https://journeyai-backend.onrender.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","firstName":"Test","lastName":"User"}'
```

## 💡 **Expected Logs After Fix:**
```
👋 New user registered: { email: 'test@example.com', name: 'Test User', ... }
📤 Attempting to send Discord signup notification...
🔍 Discord service called: { webhookConfigured: true, embedTitle: '👋 New User Signup!', ... }
📤 Sending Discord notification...
✅ Discord notification sent successfully
```

## ⏰ **Timeline:**
1. **Now:** Wait 2-3 minutes for Render redeploy
2. **Then:** Test user registration
3. **Immediately:** Check Render logs for detailed output
4. **Result:** Should see exactly where the issue is occurring

The enhanced logging will show us exactly what's happening with your Discord notifications! 🔍
