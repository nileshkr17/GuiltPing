# GuiltPing Frontend - Deployment Guide

## Deploy on Vercel (Recommended)

### Quick Deploy
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your `GuiltPing` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   - `VITE_API_URL` = `https://guiltping.onrender.com`
7. Click "Deploy"

### Auto-Deploy
Vercel automatically deploys on every push to main branch!

Your app will be available at: `https://your-app.vercel.app`

---

## Deploy on Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://guiltping.onrender.com`
6. Click "Deploy"

---

## Local Production Build

Test production build locally:
```bash
npm run build
npm run preview
```

---

## After Deployment

### 1. Update Backend CORS (if needed)
If you want to restrict CORS to your frontend domain:

On Render dashboard:
- Go to your backend service
- Environment → Edit `CORS_ORIGIN`
- Change from `*` to your frontend URL: `https://your-app.vercel.app`
- Save and redeploy

### 2. Test Your App
- Visit your deployed frontend URL
- Try signing up/logging in
- Create/join a group
- Check-in for today
- Test push notifications

### 3. Custom Domain (Optional)
Both Vercel and Netlify offer free custom domains!

---

## Troubleshooting

**Backend not connecting?**
- Check browser console for CORS errors
- Verify `.env.production` has correct `VITE_API_URL`
- Test backend directly: `https://guiltping.onrender.com/health`

**Build fails?**
- Check all dependencies are in `package.json`
- Verify no TypeScript errors locally
- Check build logs on platform

**Environment variables not working?**
- Must start with `VITE_` prefix
- Redeploy after adding new variables
- Check they're set in platform dashboard
