# 📝 Render.com Form Filling Guide - Step by Step

## Screen 1: Create Web Service Form

Jab tum "New +" → "Web Service" click karoge, ye form dikhega:

---

### Section 1: Repository Selection

**"Connect a repository"**
- Tumhara GitHub repository list dikhega
- Find karo: **your-repo-name** (jisme HabitSpark code hai)
- Click **"Connect"** button

---

### Section 2: Basic Configuration

#### Field 1: Name
```
┌─────────────────────────────────────┐
│ Name                                │
│ ┌─────────────────────────────────┐ │
│ │ habitspark-backend              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
**Type:** `habitspark-backend`
**Note:** Ye tumhare service ka naam hoga

---

#### Field 2: Region
```
┌─────────────────────────────────────┐
│ Region                              │
│ ┌─────────────────────────────────┐ │
│ │ Oregon (US West) ▼              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
**Select:** `Oregon (US West)` (dropdown se choose karo)
**Note:** Free tier ke liye best hai

---

#### Field 3: Branch
```
┌─────────────────────────────────────┐
│ Branch                              │
│ ┌─────────────────────────────────┐ │
│ │ main                            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
**Type:** `main` (ya `master` agar tumhara default branch wo hai)

---

#### Field 4: Root Directory
```
┌─────────────────────────────────────┐
│ Root Directory                      │
│ ┌─────────────────────────────────┐ │
│ │ backend                         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
**Type:** `backend`
**⚠️ IMPORTANT:** Exactly `backend` - no slash, no spaces

---

#### Field 5: Runtime
```
┌─────────────────────────────────────┐
│ Runtime                             │
│ ┌─────────────────────────────────┐ │
│ │ Node ▼                          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
**Select:** `Node` (auto-detect hoga, but verify karo)

---

### Section 3: Build & Deploy Settings

#### Field 6: Build Command
```
┌─────────────────────────────────────┐
│ Build Command                       │
│ ┌─────────────────────────────────┐ │
│ │ npm install                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
**Type:** `npm install`
**Note:** Ye dependencies install karega

---

#### Field 7: Start Command
```
┌─────────────────────────────────────┐
│ Start Command                       │
│ ┌─────────────────────────────────┐ │
│ │ npm start                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
**Type:** `npm start`
**Note:** Ye server start karega

---

### Section 4: Plan Selection

```
┌─────────────────────────────────────┐
│ Instance Type                       │
│                                     │
│ ○ Starter ($7/month)                │
│ ● Free ($0/month)          ← Select │
│                                     │
└─────────────────────────────────────┘
```
**Select:** `Free` (radio button click karo)

---

### Section 5: Environment Variables

Ye section thoda neeche scroll karne pe milega.

**Heading:** "Environment Variables" (Optional)

Click **"Add Environment Variable"** button

Har variable ke liye ye form dikhega:

```
┌─────────────────────────────────────┐
│ Key                                 │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Value                               │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Add these 8 variables one by one:**

---

#### Variable 1:
```
Key:   MONGODB_URI
Value: mongodb+srv://habitspark01_db_user:aprna%40123@cluster0.5s2c6y5.mongodb.net/
```
Click "Add Environment Variable" again for next one

---

#### Variable 2:
```
Key:   JWT_SECRET
Value: your_super_secret_jwt_key_here_make_it_long_and_complex_habitspark_2024
```

---

#### Variable 3:
```
Key:   JWT_EXPIRE
Value: 7d
```

---

#### Variable 4:
```
Key:   CLIENT_URL
Value: https://habit-aura-coral.vercel.app
```

---

#### Variable 5:
```
Key:   EMAIL_USER
Value: jeevanamrit5@gmail.com
```

---

#### Variable 6:
```
Key:   EMAIL_PASS
Value: eqjgvzedyqhpmlvj
```

---

#### Variable 7:
```
Key:   NODE_ENV
Value: production
```

---

#### Variable 8:
```
Key:   PORT
Value: 5000
```

---

### Final Step: Deploy Button

Scroll to bottom, you'll see:

```
┌─────────────────────────────────────┐
│                                     │
│   [Create Web Service]              │
│                                     │
└─────────────────────────────────────┘
```

**Click the big blue "Create Web Service" button**

---

## After Clicking Deploy

### What You'll See:

1. **Deployment Logs Screen:**
   ```
   Building...
   ==> Cloning from https://github.com/...
   ==> Downloading cache...
   ==> Running 'npm install'
   ==> Starting server...
   ==> Your service is live 🎉
   ```

2. **At the top, you'll see your URL:**
   ```
   https://habitspark-backend-xxxx.onrender.com
   ```
   **COPY THIS URL!** You'll need it for frontend.

3. **Status will change to:**
   ```
   ● Live
   ```
   Green dot means success!

---

## Quick Reference - Copy Paste Values

### Build Settings:
```
Name: habitspark-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### Environment Variables (Copy-Paste Ready):

```
MONGODB_URI
mongodb+srv://habitspark01_db_user:aprna%40123@cluster0.5s2c6y5.mongodb.net/

JWT_SECRET
your_super_secret_jwt_key_here_make_it_long_and_complex_habitspark_2024

JWT_EXPIRE
7d

CLIENT_URL
https://habit-aura-coral.vercel.app

EMAIL_USER
jeevanamrit5@gmail.com

EMAIL_PASS
eqjgvzedyqhpmlvj

NODE_ENV
production

PORT
5000
```

---

## Common Mistakes to Avoid

❌ **Wrong:** Root Directory = `/backend` (with slash)
✅ **Right:** Root Directory = `backend` (no slash)

❌ **Wrong:** Forgetting to add environment variables
✅ **Right:** Add all 8 variables before deploying

❌ **Wrong:** Selecting paid plan by mistake
✅ **Right:** Select "Free" plan

❌ **Wrong:** Wrong branch name (master vs main)
✅ **Right:** Check your GitHub repo's default branch

---

## After Deployment Success

1. **Copy your backend URL** from the top of the page
2. **Test it:** Open URL in browser
3. **Should see:**
   ```json
   {
     "message": "HabitSpark API is running",
     "status": "OK",
     "version": "1.0.0"
   }
   ```

4. **If you see this = SUCCESS!** ✅

5. **Tell me your backend URL** so I can update frontend!

---

## Troubleshooting

### If deployment fails:

1. **Click "Logs" tab** at the top
2. **Look for error messages** in red
3. **Common issues:**
   - "Cannot find module" → Wrong Root Directory
   - "npm install failed" → Check package.json exists in backend folder
   - "Port already in use" → Ignore, Render handles this

### If service keeps restarting:

1. Check Logs for crash reason
2. Usually MongoDB connection issue
3. Verify MONGODB_URI is correct

---

**Ready to deploy? Follow this guide step by step!** 🚀
