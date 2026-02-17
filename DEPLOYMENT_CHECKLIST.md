# 🚀 Deployment Checklist

## Current Setup
- **Frontend:** https://habit-aura-coral.vercel.app
- **Backend:** https://habit-aura-one.vercel.app

## ✅ Backend Deployment (Vercel)

### 1. Verify Environment Variables on Vercel Dashboard

Go to: https://vercel.com/dashboard → habit-aura-one → Settings → Environment Variables

**Required Variables:**
```
MONGODB_URI = mongodb+srv://habitspark01_db_user:aprna%40123@cluster0.5s2c6y5.mongodb.net/
JWT_SECRET = your_super_secret_jwt_key_here_make_it_long_and_complex_habitspark_2024
JWT_EXPIRE = 7d
CLIENT_URL = https://habit-aura-coral.vercel.app
EMAIL_USER = jeevanamrit5@gmail.com
EMAIL_PASS = eqjgvzedyqhpmlvj
NODE_ENV = production
```

**Important:** Make sure ALL variables are set for "Production" environment!

### 2. Commit & Push Backend Changes

```bash
cd backend
git add .
git commit -m "Fix: Vercel serverless configuration"
git push origin main
```

### 3. Verify Backend Deployment

Wait 2-3 minutes, then test:

```bash
# Test root endpoint
curl https://habit-aura-one.vercel.app

# Should return: {"message":"HabitSpark API is running",...}
```

If you get 500 error, check Vercel logs:
- Go to Vercel Dashboard → habit-aura-one → Deployments → Latest → View Function Logs

---

## ✅ Frontend Deployment (Vercel)

### 1. Verify Environment Variables

Go to: https://vercel.com/dashboard → habit-aura-coral → Settings → Environment Variables

**Required Variable:**
```
VITE_API_URL = https://habit-aura-one.vercel.app
```

Set for: Production, Preview, Development (all three!)

### 2. Commit & Push Frontend Changes

```bash
cd frontend
git add .
git commit -m "Update: API configuration"
git push origin main
```

### 3. Force Rebuild (Important!)

In Vercel Dashboard:
1. Go to habit-aura-coral → Deployments
2. Click on latest deployment → Three dots (⋯) → Redeploy
3. **UNCHECK** "Use existing Build Cache"
4. Click "Redeploy"

---

## 🧪 Testing

### 1. Clear Browser Cache
- Press: Ctrl + Shift + Delete
- Or: Ctrl + F5 (Hard Refresh)
- Or: Open in Incognito/Private window

### 2. Test Login
1. Go to: https://habit-aura-coral.vercel.app
2. Try to login
3. Check browser console (F12) for errors

### 3. Check Network Tab
- Open DevTools (F12) → Network tab
- Try login
- Look for request to: `https://habit-aura-one.vercel.app/api/auth/login`
- Should return 200 OK (not 500 or 404)

---

## 🐛 Troubleshooting

### If Backend Returns 500 Error:

**Check Vercel Logs:**
1. Vercel Dashboard → habit-aura-one → Deployments
2. Click latest deployment → "View Function Logs"
3. Look for error messages

**Common Issues:**
- ❌ MongoDB connection timeout → Check MONGODB_URI
- ❌ JWT_SECRET missing → Add environment variable
- ❌ CORS error → Check CLIENT_URL matches frontend URL

### If Frontend Shows "Connection Refused":

**Check:**
1. Browser is loading old cached version → Clear cache
2. Environment variable not set → Check Vercel dashboard
3. Build cache issue → Redeploy without cache

### If Still Not Working:

**Alternative: Deploy Backend on Render.com**

Vercel has limitations with MongoDB connections. Consider:
1. Deploy backend on Render.com (see DEPLOYMENT.md)
2. Update frontend VITE_API_URL to Render URL
3. Redeploy frontend

---

## 📝 Post-Deployment

### Update CORS in Backend

If you change frontend URL, update backend CORS:

In `backend/server.js`, line ~13:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://habit-aura-coral.vercel.app',  // ← Your frontend URL
  process.env.CLIENT_URL
].filter(Boolean)
```

### Monitor Logs

- Backend logs: Vercel Dashboard → habit-aura-one → Deployments → Function Logs
- Frontend logs: Browser Console (F12)

---

## ✨ Success Indicators

✅ Backend health check returns JSON
✅ Frontend loads without console errors
✅ Login works and redirects to dashboard
✅ No CORS errors in console
✅ Network requests show 200 OK status

---

## 🆘 Need Help?

If issues persist:
1. Check Vercel function logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Consider deploying backend on Render.com instead
