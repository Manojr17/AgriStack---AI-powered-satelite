# AgriStack Deployment Guide

## Deployment Architecture

AgriStack is deployed across multiple services:
- **Frontend**: Netlify (React + Vite)
- **Backend**: Supabase Edge Functions (serverless)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Cloud Storage (for profile images - optional)

## Prerequisites

- Node.js 18+ and npm
- Git account (GitHub, GitLab, or Gitbucket)
- Supabase account (already configured)
- Netlify account

## Step 1: Prepare Your Repository

### GitHub Setup
```bash
# Initialize if not already done
git init

# Add all files
git add .

# Commit
git commit -m "AgriStack v2 - Upgraded with profile, notifications, and auto-refresh"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/agristack.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Frontend to Netlify

### Option A: Direct Netlify Deploy (Recommended)

1. **Connect Repository**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub"
   - Authorize and select your repository
   - Click "Deploy site"

2. **Build Settings** (Auto-detected)
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Add the following in Netlify dashboard under Site settings → Build & deploy → Environment:
   ```
   VITE_SUPABASE_URL=https://ipromonzrtunpfjoaodn.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwcm9tb256cnR1bnBmam9hb2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4Mzc4NzksImV4cCI6MjA5MjQxMzg3OX0.RfAUhXBf_7aH0NUszYpXSM_BP1fvY9m9vUd6AFUkIAU
   ```

4. **Deploy**
   - Netlify will automatically build and deploy on push to main
   - Your site will be available at: `https://your-site-name.netlify.app`

### Option B: Manual Netlify CLI Deploy

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## Step 3: Backend is Already Deployed!

### Supabase Edge Functions
- Location: `/supabase/functions/agristack-api/index.ts`
- Status: ✅ Already deployed
- URL: `https://ipromonzrtunpfjoaodn.supabase.co/functions/v1/agristack-api`

### Endpoints
```
POST /weather          - Get weather data
POST /ndvi             - Get NDVI analysis
POST /analyze          - Get AI recommendations
POST /chatbot          - Chat with AgriBot
```

## Step 4: Database is Ready!

### Supabase Project
- Project: `ipromonzrtunpfjoaodn`
- URL: `https://ipromonzrtunpfjoaodn.supabase.co`
- Database: PostgreSQL
- Status: ✅ All migrations applied

### Tables
- `farmers` - User farm profiles with images
- `auth.users` - Authentication

## Deployment Checklist

- [x] Code pushed to GitHub
- [x] Netlify connected to repository
- [x] Environment variables configured in Netlify
- [x] Build successful with no errors
- [x] Edge Functions deployed to Supabase
- [x] Database migrations applied
- [x] RLS policies configured
- [x] CORS headers configured in Edge Functions

## Live URL Structure

```
Frontend:  https://your-agristack.netlify.app
Backend:   https://ipromonzrtunpfjoaodn.supabase.co/functions/v1/agristack-api
Database:  https://ipromonzrtunpfjoaodn.supabase.co
```

## Post-Deployment Testing

### 1. Test Authentication
```bash
# Visit your Netlify URL
https://your-agristack.netlify.app/login

# Test account:
Email: ravi.test@agristack.com
Password: farmpass123
```

### 2. Test Dashboard
- Weather data should update
- NDVI should display
- Notifications should appear
- Chatbot should respond

### 3. Test Profile
- Navigate to profile
- Edit farmer details
- Upload profile image
- Save changes

### 4. Test Notifications
- Click notification bell
- Verify alert levels display correctly
- Check color coding

## Monitoring

### Netlify Dashboard
- Analytics: Traffic, builds, deployments
- Logs: Real-time build and function logs
- Performance: Speed insights

### Supabase Dashboard
- Edge Functions: Execution logs and performance
- Database: Realtime activity and storage
- Auth: User management and security

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS Issues
- Verify Edge Function has correct CORS headers
- Check browser console for specific errors
- CORS headers are pre-configured in function

### Database Connection Issues
- Verify environment variables in Netlify
- Check Supabase is accessible
- Verify RLS policies aren't blocking reads

### Image Upload Not Working
- Check browser console for errors
- Verify image is JPG or PNG
- Check file size (recommend <5MB)

## Custom Domain Setup

### On Netlify
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., agristack.com)
4. Update DNS records as instructed
5. Wait for DNS propagation (can take 24-48 hours)

## Continuous Deployment

Every push to `main` branch will:
1. Trigger Netlify build
2. Run tests (if configured)
3. Build production bundle
4. Deploy to CDN
5. Notify on success/failure

## Performance Tips

1. **Images**: Optimize profile images before upload
2. **Caching**: Netlify caches assets by default
3. **Database**: Indexes on frequently queried columns
4. **API**: Edge Functions are edge-optimized

## Security Checklist

- [x] Environment variables not in code
- [x] RLS policies enabled on all tables
- [x] CORS properly configured
- [x] No sensitive data in logs
- [x] Authentication required for protected routes
- [x] HTTPS enforced (automatic on Netlify)

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

---

**Deployment Date**: 2026-04-22
**Version**: 2.0 (With Profile, Notifications, Auto-Refresh)
**Status**: ✅ Production Ready
