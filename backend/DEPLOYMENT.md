# Backend Deployment Guide

## Option 1: Render.com (Recommended - Free & Easy)

### Steps:

1. **Go to [Render.com](https://render.com)** and sign up/login

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**

4. **Configure:**
   - Name: `habitspark-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Add Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://habitspark01_db_user:aprna%40123@cluster0.5s2c6y5.mongodb.net/
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex_habitspark_2024
   JWT_EXPIRE=7d
   CLIENT_URL=https://habit-aura-coral.vercel.app
   EMAIL_USER=jeevanamrit5@gmail.com
   EMAIL_PASS=eqjgvzedyqhpmlvj
   NODE_ENV=production
   PORT=5000
   ```

6. **Click "Create Web Service"**

7. **Copy your backend URL** (e.g., `https://habitspark-backend.onrender.com`)

8. **Update frontend `.env.production`:**
   ```
   VITE_API_URL=https://habitspark-backend.onrender.com
   ```

9. **Redeploy frontend on Vercel**

---

## Option 2: Railway.app (Also Free & Easy)

### Steps:

1. **Go to [Railway.app](https://railway.app)** and sign up/login

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select your repository**

4. **Configure:**
   - Root Directory: `backend`
   - Start Command: `npm start`

5. **Add Environment Variables** (same as above)

6. **Deploy!**

7. **Copy your backend URL** and update frontend

---

## Option 3: Vercel (Current - Has Issues)

Vercel is not ideal for Node.js backends with MongoDB connections.
Consider using Render or Railway instead.

---

## Testing Backend

After deployment, test your backend:

```bash
# Health check
curl https://your-backend-url.com

# Login endpoint
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Important Notes

- Free tier on Render may sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- For production, consider paid tier for always-on service
