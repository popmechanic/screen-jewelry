# Deployment Guide for Screen Jewelry

## Recommended Platform: Vercel

### Prerequisites
1. GitHub account (your code is already on GitHub)
2. Vercel account (sign up at vercel.com - can use GitHub login)
3. InstantDB app ID from your .env.local

### Deployment Steps

#### 1. Connect to Vercel
```bash
# If not already installed
npm install -g vercel

# Deploy
vercel
```

Or use the web interface:
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `popmechanic/screen-jewelry`
4. Vercel will auto-detect Next.js

#### 2. Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:
- `NEXT_PUBLIC_INSTANT_APP_ID` - Your InstantDB app ID

#### 3. Deploy
- Vercel will automatically deploy on every push to `main` branch
- Preview deployments for PRs are automatic

### Why Vercel?

✅ **Perfect for your stack:**
- Built by the creators of Next.js
- Optimized for Next.js 15 and Turbopack
- Serverless functions for API routes
- Edge network for fast image delivery

✅ **Features you'll use:**
- Automatic HTTPS
- Global CDN for your images
- Preview deployments for testing
- Analytics (optional)
- Web Vitals monitoring

✅ **Cost effective:**
- Free tier includes:
  - 100GB bandwidth/month
  - Unlimited deployments
  - SSL certificates
  - Custom domains

### Alternative Options

If you need different features:

1. **Netlify** - Similar to Vercel, good alternative
2. **AWS Amplify** - If you want AWS ecosystem
3. **Render** - If you need background jobs later
4. **Self-hosted** - VPS with Docker if you need full control

### Post-Deployment Checklist

- [ ] Set up custom domain (optional)
- [ ] Configure InstantDB production permissions
- [ ] Test image upload functionality
- [ ] Verify gallery performance
- [ ] Set up monitoring/alerts (optional)

### Environment Variables Reference

```bash
# Required
NEXT_PUBLIC_INSTANT_APP_ID=your_instant_app_id

# Optional (for future features)
# NEXT_PUBLIC_ANALYTICS_ID=
# NEXT_PUBLIC_CDN_URL=
```

### Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# Set environment variables via CLI
vercel env add NEXT_PUBLIC_INSTANT_APP_ID
```

### Support

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [InstantDB Docs](https://instantdb.com/docs)