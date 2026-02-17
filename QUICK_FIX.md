# 🚀 QUICK FIX - Backend Deployment Issue

## Problem
Vercel doesn't work well with Node.js + MongoDB backends.

## Solution (5 Minutes)

### Step 1: Deploy Backend on Render.com

1. Open: https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Settings:
   - **Name:** `habitspark-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

6. Click **"Advanced"** → Add Environment Variables:
   ```
   MONGODB_URI = mongodb+srv://habitspark01_db_user:aprna%40123@cluster0.5s2c6y5.mongodb.net/
   JWT_SECRET = your_super_secret_jwt_key_here_make_it_long_and_complex_habitspark_2024
   JWT_EXPIRE = 7d
   CLIENT_URL = https://habit-aura-coral.vercel.app
   EMAIL_USER = jeevanamrit5@gmail.com
   EMAIL_PASS = eqjgvzedyqhpmlvj
   NODE_ENV = production
   ```

7. Click **"Create Web Service"**
8. Wait 2-3 minutes for deployment
9. **COPY YOUR BACKEND URL** (looks like: `https://habitspark-backend.onrender.com`)

### Step 2: Update Frontend

1. Open `frontend/.env.production`
2. Change to:
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com
   ```
   (Replace with your actual Render URL)

3. Also update `frontend/src/config/api.js`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 
     (import.meta.env.MODE === 'production' 
       ? 'https://YOUR-BACKEND-URL.onrender.com'  // ← Change this
       : 'http://localhost:5000')
   ```

### Step 3: Redeploy Frontend

1. Commit changes:
   ```bash
   git add .
   git commit -m "Update backend URL to Render"
   git push
   ```

2. Vercel will auto-redeploy (or manually redeploy from dashboard)

### Step 4: Test

1. Open: https://habit-aura-coral.vercel.app
2. Try to login
3. Should work! 🎉

---

## Why This Works

- ✅ Render is designed for Node.js apps
- ✅ Free tier available
- ✅ Supports MongoDB connections
- ✅ No serverless complications
- ✅ Easy environment variables

---

## Note About Free Tier

- Backend sleeps after 15 min of inactivity
- First request takes 30-60 sec to wake up
- Subsequent requests are fast
- For production, upgrade to paid tier ($7/month)

---

## Alternative: Railway.app

If Render doesn't work, try Railway.app:
1. Go to: https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repo → Select `backend` folder
4. Add same environment variables
5. Deploy!

Railway URL format: `https://your-app.up.railway.app`
