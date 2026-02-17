# ✅ Frontend Deployment Ready!

## Backend Configuration
**Backend URL:** `https://habit-backend-5bd8.onrender.com`

## Frontend Files Updated ✅

### 1. `.env` file
```
VITE_API_URL=https://habit-backend-5bd8.onrender.com
```

### 2. `.env.production` file
```
VITE_API_URL=https://habit-backend-5bd8.onrender.com
```

### 3. `src/config/api.js` file
```javascript
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://habit-backend-5bd8.onrender.com' 
    : 'http://localhost:5000')
```

---

## 🚀 Deploy Frontend on Vercel - Step by Step

### Step 1: Commit Changes

```bash
git add .
git commit -m "Connect frontend to Render backend"
git push origin main
```

---

### Step 2: Deploy on Vercel

#### Option A: New Deployment (Fresh Start)

1. **Go to:** https://vercel.com

2. **Click:** "Add New..." → "Project"

3. **Import Repository:**
   - Click "Import" on your repository
   - If not showing: "Adjust GitHub App Permissions"

4. **Configure Project:**

```
┌─────────────────────────────────────────────┐
│ Project Name                                │
│ ┌─────────────────────────────────────────┐ │
│ │ habitspark-frontend                     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Framework Preset                            │
│ ┌─────────────────────────────────────────┐ │
│ │ Vite ▼                                  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Root Directory                              │
│ ┌─────────────────────────────────────────┐ │
│ │ frontend                                │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Build Command                               │
│ ┌─────────────────────────────────────────┐ │
│ │ npm run build                           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Output Directory                            │
│ ┌─────────────────────────────────────────┐ │
│ │ dist                                    │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Install Command                             │
│ ┌─────────────────────────────────────────┐ │
│ │ npm install                             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

5. **Environment Variables:**

Click "Add" button and enter:

```
┌─────────────────────────────────────────────┐
│ Name                                        │
│ ┌─────────────────────────────────────────┐ │
│ │ VITE_API_URL                            │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Value                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ https://habit-backend-5bd8.onrender.com │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Environments:                               │
│ ☑ Production                                │
│ ☑ Preview                                   │
│ ☑ Development                               │
└─────────────────────────────────────────────┘
```

6. **Click:** "Deploy"

7. **Wait:** 1-2 minutes

8. **Copy your frontend URL** when done!

---

#### Option B: Update Existing Deployment

If you already have `habit-aura-coral` project:

1. **Go to:** https://vercel.com/dashboard

2. **Open:** `habit-aura-coral` project

3. **Settings → Environment Variables**

4. **Find `VITE_API_URL`:**
   - If exists: Click "Edit"
   - If not: Click "Add New"

5. **Update/Add:**
   ```
   Name: VITE_API_URL
   Value: https://habit-backend-5bd8.onrender.com
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

6. **Save**

7. **Go to Deployments tab**

8. **Click "..." on latest → Redeploy**

9. **UNCHECK "Use existing Build Cache"**

10. **Click Redeploy**

---

### Step 3: Update Backend CORS

Backend ko frontend URL batana padega:

1. **Go to:** https://dashboard.render.com

2. **Open:** `habit-backend-5bd8` service

3. **Click:** "Environment" (left sidebar)

4. **Find:** `CLIENT_URL` variable

5. **Click:** Edit button (pencil icon)

6. **Update value to your new frontend URL:**
   ```
   https://habitspark-frontend.vercel.app
   ```
   (Or whatever your Vercel URL is)

7. **Click:** "Save Changes"

8. **Wait:** 1 minute for auto-redeploy

---

## 🧪 Testing Checklist

### Test 1: Backend Health
Open in browser:
```
https://habit-backend-5bd8.onrender.com
```

Should see:
```json
{
  "message": "HabitSpark API is running",
  "status": "OK",
  "version": "1.0.0"
}
```

### Test 2: Frontend Loading
Open your Vercel URL:
```
https://your-frontend-url.vercel.app
```

Should see landing page with no errors.

### Test 3: API Connection
1. Open frontend
2. Press F12 (DevTools)
3. Go to Console tab
4. Try to signup/login
5. Check Network tab
6. Should see requests to: `https://habit-backend-5bd8.onrender.com/api/...`
7. Status should be 200 OK ✅

---

## 📋 Quick Copy-Paste Values

### Vercel Configuration:
```
Project Name: habitspark-frontend
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Environment Variable:
```
VITE_API_URL=https://habit-backend-5bd8.onrender.com
```

---

## ⚠️ Important Notes

1. **First Request Delay:**
   - Render free tier sleeps after 15 min
   - First request takes 30-60 seconds
   - Show loading state to users

2. **CORS:**
   - Make sure CLIENT_URL in Render matches your Vercel URL
   - Include https://
   - No trailing slash

3. **Cache:**
   - Always redeploy without cache when changing env variables
   - Clear browser cache when testing

---

## 🎉 Success Indicators

✅ Backend returns JSON at root URL
✅ Frontend loads without console errors
✅ Network requests go to Render backend
✅ Login/Signup works
✅ No CORS errors
✅ Dashboard accessible after login

---

## 🆘 Troubleshooting

### Problem: "Failed to fetch" error

**Solution:**
1. Check if backend is awake (visit backend URL)
2. Wait 60 seconds if it's waking up
3. Check CORS settings in Render

### Problem: CORS error

**Solution:**
1. Verify CLIENT_URL in Render matches frontend URL exactly
2. Redeploy backend after changing CLIENT_URL
3. Clear browser cache

### Problem: Environment variable not working

**Solution:**
1. Verify VITE_API_URL is set in Vercel
2. Redeploy WITHOUT cache
3. Check browser console: `console.log(import.meta.env.VITE_API_URL)`

---

## 📝 After Deployment

Save these URLs:

```
Backend:  https://habit-backend-5bd8.onrender.com
Frontend: https://your-frontend-url.vercel.app
```

Update README.md with live URLs!

---

**Ready to deploy! Follow the steps above.** 🚀

**After deployment, tell me your frontend URL so I can verify everything is connected properly!**
