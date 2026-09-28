# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites

1. Vercel account
2. Git repository (GitHub, GitLab, or Bitbucket)
3. MongoDB database instance (MongoDB Atlas recommended)

### Step 1: Prepare Environment Variables

Create these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/school-management` |
| `AUTH_SECRET` | NextAuth secret (32+ chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://your-app.vercel.app` |

### Step 2: Set Up MongoDB Atlas

1. Create a free cluster at https://mongodb.com/atlas
2. Create a database user
3. Get connection string from Atlas Dashboard → Connect → Connect with Node.js
4. Whitelist Vercel IPs (or allow all IPs for simplicity)
5. Create database named `school-management`

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or connect via Vercel Dashboard:
1. Import Git Repository
2. Configure Environment Variables
3. Deploy

### Step 4: Seed the Database

After deployment, run the seed script locally or via Vercel job:

```bash
npm run db:seed
```

Or use a GitHub Actions workflow for automatic seeding.

## Run with Node

Production uses `npm run build` and `npm run start`. `next.config.ts` does not set `output: "standalone"`, so a Docker image should run `next start` with `MONGODB_URI`, `AUTH_SECRET`, and `NEXTAUTH_URL` set. A standalone server copy is not part of this repo.

## Environment-specific configurations

### Development (.env)
```env
MONGODB_URI="mongodb://localhost:27017/school-management"
AUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Production (.env.production)
```env
MONGODB_URI="your-production-mongodb-uri"
AUTH_SECRET="strong-random-secret-32-chars-min"
NEXTAUTH_URL="https://your-domain.com"
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deployment Checklist

- [ ] Verify all environment variables set in Vercel
- [ ] Run database seed (npm run db:seed)
- [ ] Test authentication flow
- [ ] Verify all role dashboards load correctly
- [ ] Check dark/light mode toggle
- [ ] Test responsive layout on mobile
- [ ] Verify error boundaries work
- [ ] Run accessibility audit on production URL
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Configure custom domain (optional)

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` format
- Check Atlas IP whitelist
- Ensure database user has correct permissions
- Check connection string includes correct database name

### NextAuth Errors
- Verify `AUTH_SECRET` is set and matches
- Check `NEXTAUTH_URL` matches deployment URL
- Ensure callback URLs are configured

### Build Failures
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all imports resolve correctly
- Ensure MONGODB_URI is set during build
