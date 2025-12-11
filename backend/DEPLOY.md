# GuiltPing Backend - Render Deployment Guide

## Prerequisites
1. GitHub account with your code pushed
2. MongoDB Atlas account (free tier)
3. Render.com account (free tier)

## Step 1: Set Up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up/Login and create a **Free M0 Cluster**
3. Click **Connect** → **Connect your application**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your actual password
6. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/guiltping`
7. **Important**: Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)

## Step 2: Generate VAPID Keys (for Push Notifications)

Run this in your terminal:
```bash
cd backend
npx web-push generate-vapid-keys
```

Save the output - you'll need both public and private keys.

## Step 3: Deploy on Render

### Option A: Using render.yaml (Recommended)
1. Go to [render.com](https://render.com) and sign up/login
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. Add environment variables:
   - `MONGO_URI`: Your MongoDB connection string from Step 1
   - `JWT_SECRET`: Any random string (e.g., `your-super-secret-jwt-key-12345`)
   - `VAPID_PUBLIC_KEY`: Public key from Step 2
   - `VAPID_PRIVATE_KEY`: Private key from Step 2
6. Click **Apply** and wait for deployment

### Option B: Manual Setup
1. Go to [render.com](https://render.com) and sign up/login
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `guiltping-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables (click **Advanced** → **Add Environment Variable**):
   ```
   NODE_ENV=production
   PORT=4001
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-secret-key>
   VAPID_PUBLIC_KEY=<your-vapid-public-key>
   VAPID_PRIVATE_KEY=<your-vapid-private-key>
   CORS_ORIGIN=*
   ```
6. Click **Create Web Service**

## Step 4: Update Frontend

After deployment, Render will give you a URL like: `https://guiltping-backend.onrender.com`

Update your frontend API configuration:

1. Create/update `frontend/.env.production`:
```env
VITE_API_URL=https://guiltping-backend.onrender.com
```

2. Or update `src/lib/api.ts` to use the Render URL in production

## Step 5: Test Your Deployment

1. Visit: `https://your-app-name.onrender.com/health`
2. You should see: `{"ok":true}`
3. Check the Render logs for any errors

## Important Notes

### Free Tier Limitations
- **Cold starts**: Backend sleeps after 15 minutes of inactivity
- **First request takes 30-60 seconds** to wake up the server
- This is why you added the backend error screen!

### Upgrade Options
- **Starter Plan ($7/month)**: No sleep, always-on
- **Standard Plan ($25/month)**: Better performance, more resources

### Cron Jobs
The free tier won't run background cron jobs reliably. For daily notifications:
1. Upgrade to a paid plan, OR
2. Use Render Cron Jobs (separate service), OR
3. Use an external service like cron-job.org to ping your `/api/notifications/send` endpoint daily

## Troubleshooting

**Backend not starting?**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB IP whitelist includes 0.0.0.0/0

**Database connection failed?**
- Verify MONGO_URI is correct
- Check MongoDB Network Access settings
- Ensure database user has read/write permissions

**CORS errors?**
- Update CORS_ORIGIN to your frontend domain
- Or keep it as `*` for testing

## Auto-Deploy
Render automatically deploys when you push to your main branch on GitHub!

## Next Steps
1. Deploy frontend on Vercel/Netlify
2. Update CORS_ORIGIN to your frontend domain
3. Consider upgrading to paid plan if app gets traction
