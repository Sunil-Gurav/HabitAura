# 🚀 Complete Deployment Guide - HabitSpark

## Overview
- **Backend:** Render.com (Free)
- **Frontend:** Vercel (Free)
- **Database:** MongoDB Atlas (Already setup)

---

## Part 1: Backend Deployment on Render.com

### Step 1: Create Render Account

1. **Open browser** and go to: **https://render.com**

2. **Click "Get Started for Free"** (top right corner)

3. **Sign up options:**
   - Click **"GitHub"** button (recommended - easiest)
   - It will ask for GitHub authorization
   - Click **"Authorize Render"**

4. **You're now logged in!** You'll see the Render Dashboard

---

### Step 2: Connect GitHub Repository

1. **On Render Dashboard**, click the **"New +"** button (top right)

2. **Select "Web Service"** from dropdown

3. **Connect Repository:**
   - If first time: Click **"Connect GitHub"**
   - Select **"All repositories"** or **"Only select repositories"**
   - If selecting specific: Choose your **HabitSpark repository**
   - Click **"Install"**

4. **Find your repository** in the list and click **"Connect"**

---

### Step 3: Configure Web Service

Now you'll see a form. Fill it carefully:

#### Basic Settings:

**Name:**
```
habitspark-backend
```
(You can choose any name, but this is clean)

**Region:**
```
Oregon (US West)
```
(Choose closest to you, but Oregon is good for free tier)

**Branch:**
```
main
```
(Or `master` if that's your default branch)

**Root Directory:**
```
backend
```
⚠️ **IMPORTANT:** Type exactly `backend` - this tells Render to look in the backend folder

**Runtime:**
```
Node
```
(Should auto-detect, but make sure it says "Node")

**Build Command:**
```
npm install
```
(This installs all dependencies)

**Start Command:**
```
npm start
```
(This runs your server)

---

### Step 4: Choose Plan

**Instance Type:**
```
Free
```
(Select the Free tier - $0/month)

**Note:** Free tier sleeps after 15 min inactivity. First request takes 30-60 sec to wake up.

---

### Step 5: Add Environment Variables

This is **VERY IMPORTANT**. Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** button for each of these:

#### Variable 1:
```
Key: MONGODB_URI
Value: mongodb+srv://habitspark01_db_user:aprna%40123@cluster0.5s2c6y5.mongodb.net/
```

#### Variable 2:
```
Key: JWT_SECRET
Value: your_super_secret_jwt_key_here_make_it_long_and_complex_habitspark_2024
```

#### Variable 3:
```
Key: JWT_EXPIRE
Value: 7d
```

#### Variable 4:
```
Key: CLIENT_URL
Value: https://habit-aura-coral.vercel.app
```
(Your frontend URL - we'll update this if needed)

#### Variable 5:
```
Key: EMAIL_USER
Value: jeevanamrit5@gmail.com
```

#### Variable 6:
```
Key: EMAIL_PASS
Value: eqjgvzedyqhpmlvj
```

#### Variable 7:
```
Key: NODE_ENV
Value: production
```

#### Variable 8:
```
Key: PORT
Value: 5000
```

**Total: 8 environment variables**

---

### Step 6: Deploy!

1. **Scroll to bottom**

2. Click **"Create Web Service"** button (big blue button)

3. **Wait for deployment:**
   - You'll see logs scrolling
   - "Installing dependencies..."
   - "Building..."
   - "Starting server..."
   - Should take 2-3 minutes

4. **Success indicators:**
   - Green checkmark ✅
   - Status: "Live"
   - You'll see: "Your service is live at https://habitspark-backend.onrender.com"

5. **COPY YOUR BACKEND URL** 
   - It will look like: `https://habitspark-backend-XXXX.onrender.com`
   - Or: `https://habitspark-backend.onrender.com`
   - **SAVE THIS URL** - you'll need it for frontend!

---

### Step 7: Test Backend

1. **Click on your backend URL** or open in new tab

2. **You should see:**
```json
{
  "message": "HabitSpark API is running",
  "status": "OK",
  "version": "1.0.0",
  "timestamp": "2026-02-17T..."
}
```

3. **If you see this = SUCCESS!** ✅

4. **If you see error:**
   - Click "Logs" tab in Render dashboard
   - Check for errors
   - Usually MongoDB connection issue - verify MONGODB_URI

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Update Frontend Configuration

**Before deploying frontend, we need to update the backend URL.**

Open your project and update these files:

#### File 1: `frontend/.env.production`
```
VITE_API_URL=https://YOUR-RENDER-URL.onrender.com
```
Replace `YOUR-RENDER-URL` with your actual Render backend URL

#### File 2: `frontend/src/config/api.js`
```javascript
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://YOUR-RENDER-URL.onrender.com'  // ← Update this
    : 'http://localhost:5000')

export default API_URL
```

**Save both files!**

---

### Step 2: Commit and Push Changes

Open terminal in your project root:

```bash
git add .
git commit -m "Update backend URL to Render"
git push origin main
```

---

### Step 3: Deploy Frontend on Vercel

#### Option A: If you already have Vercel project

1. Go to **https://vercel.com/dashboard**

2. Find your **habit-aura-coral** project

3. Click on it

4. Go to **Settings** → **Environment Variables**

5. **Add or Update:**
   ```
   Name: VITE_API_URL
   Value: https://YOUR-RENDER-URL.onrender.com
   Environments: Production, Preview, Development (check all 3)
   ```

6. Click **"Save"**

7. Go to **Deployments** tab

8. Click **"..."** (three dots) on latest deployment

9. Click **"Redeploy"**

10. **UNCHECK** "Use existing Build Cache"

11. Click **"Redeploy"**

12. Wait 1-2 minutes

#### Option B: Fresh Vercel Deployment

1. Go to **https://vercel.com**

2. Click **"Add New..."** → **"Project"**

3. **Import Git Repository:**
   - Click **"Import"** on your repository
   - If not showing: Click "Adjust GitHub App Permissions"

4. **Configure Project:**
   ```
   Project Name: habitspark-frontend
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Environment Variables:**
   Click "Add" and enter:
   ```
   Name: VITE_API_URL
   Value: https://YOUR-RENDER-URL.onrender.com
   ```

6. Click **"Deploy"**

7. Wait 1-2 minutes

8. **Copy your frontend URL** (e.g., `https://habitspark-frontend.vercel.app`)

---

### Step 4: Update Backend CORS

**Important:** Backend needs to allow your frontend URL.

1. Go back to **Render Dashboard**

2. Click on your **habitspark-backend** service

3. Go to **Environment** tab

4. Find **CLIENT_URL** variable

5. Click **"Edit"**

6. Update value to your **Vercel frontend URL**:
   ```
   https://habitspark-frontend.vercel.app
   ```

7. Click **"Save Changes"**

8. Service will **auto-redeploy** (wait 1 minute)

---

## Part 3: Testing Everything

### Test 1: Backend Health Check

Open browser:
```
https://YOUR-RENDER-URL.onrender.com
```

Should see:
```json
{"message":"HabitSpark API is running","status":"OK",...}
```

### Test 2: Frontend Loading

Open browser:
```
https://YOUR-VERCEL-URL.vercel.app
```

Should see your landing page with no console errors.

### Test 3: Login/Signup

1. Open frontend URL

2. **Open DevTools** (Press F12)

3. Go to **Console** tab

4. Try to **Sign Up** with test account:
   ```
   Username: testuser
   Email: test@example.com
   Password: test123
   ```

5. **Check Console:**
   - Should see OTP sent message
   - No "Connection Refused" errors
   - No 500 errors

6. **Check Network tab:**
   - Should see request to: `https://YOUR-RENDER-URL.onrender.com/api/auth/send-otp`
   - Status: 200 OK ✅

### Test 4: Complete Signup

1. Check your email for OTP

2. Enter OTP

3. Should redirect to dashboard

4. **SUCCESS!** 🎉

---

## Troubleshooting

### Backend Issues

**Problem: 500 Error on Render**

Solution:
1. Go to Render Dashboard → Your service → Logs
2. Look for error messages
3. Common issues:
   - MongoDB connection failed → Check MONGODB_URI
   - Missing environment variable → Add it in Environment tab

**Problem: Service keeps restarting**

Solution:
1. Check Logs for crash reason
2. Usually Node.js version issue
3. Make sure `package.json` has: `"engines": { "node": "24.x" }`

### Frontend Issues

**Problem: Still showing "Connection Refused"**

Solution:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + F5)
3. Check if VITE_API_URL is set in Vercel dashboard
4. Redeploy without cache

**Problem: CORS Error**

Solution:
1. Make sure CLIENT_URL in Render matches your Vercel URL exactly
2. Include https:// in the URL
3. No trailing slash

---

## Summary Checklist

### Backend (Render):
- ✅ Account created
- ✅ Repository connected
- ✅ Web service configured
- ✅ 8 environment variables added
- ✅ Deployed successfully
- ✅ Health check returns JSON
- ✅ Backend URL copied

### Frontend (Vercel):
- ✅ Backend URL updated in code
- ✅ Changes committed and pushed
- ✅ VITE_API_URL environment variable set
- ✅ Deployed successfully
- ✅ Frontend URL copied
- ✅ Backend CORS updated with frontend URL

### Testing:
- ✅ Backend health check works
- ✅ Frontend loads without errors
- ✅ Signup sends OTP
- ✅ Login works
- ✅ Dashboard accessible

---

## Final URLs

After deployment, you'll have:

```
Backend:  https://habitspark-backend.onrender.com
Frontend: https://habitspark-frontend.vercel.app
Database: MongoDB Atlas (already configured)
```

---

## Important Notes

1. **Free Tier Limitations:**
   - Render backend sleeps after 15 min inactivity
   - First request takes 30-60 seconds to wake up
   - Subsequent requests are fast

2. **For Production:**
   - Upgrade Render to paid tier ($7/month) for always-on
   - Add custom domain
   - Enable SSL (automatic on both platforms)

3. **Monitoring:**
   - Render: Check logs in dashboard
   - Vercel: Check function logs in dashboard
   - MongoDB: Check Atlas dashboard for connections

---

## Need Help?

If you face any issues:
1. Check Render logs (Logs tab)
2. Check Vercel deployment logs
3. Check browser console (F12)
4. Verify all environment variables are set correctly

---

**Good luck with deployment! 🚀**
