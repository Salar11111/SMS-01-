# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites

1. Vercel account
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Database provider account (see options below)

### Step 1: Prepare Environment Variables

Create these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `libsql://your-db.turso.io?authToken=...` |
| `AUTH_SECRET` | NextAuth secret (32+ chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://your-app.vercel.app` |

### Step 2: Choose Database Provider

#### Option A: Turso (SQLite - Recommended for Simplicity)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create school-management

# Get connection URL
turso db show school-management --url
turso db tokens create school-management
```

Update `.env`:
```
DATABASE_URL="libsql://school-management-you.turso.io?authToken=your-token"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "libsql"
  url      = env("DATABASE_URL")
}
```

Add `@libsql/client`:
```bash
npm install @libsql/client
npm install -D @types/libsql
```

#### Option B: PlanetScale (MySQL)

1. Create database at https://planetscale.com
2. Get connection string from "Connect" → "Prisma"
3. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
4. Run `npm run db:migrate` (creates migration files)
5. Run `npx prisma db push` for initial schema

#### Option C: Neon (PostgreSQL)

1. Create project at https://neon.tech
2. Get connection string from dashboard
3. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
4. Run `npm run db:migrate`

#### Option D: Supabase (PostgreSQL)

1. Create project at https://supabase.com
2. Get connection string from Settings → Database
3. Same as Neon setup

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

### Step 4: Run Migrations on Production

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

Or use GitHub Actions for automatic migrations on deploy.

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma Client
FROM base AS generator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=generator /app/node_modules/.prisma ./node_modules/.prisma
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/school
      - AUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=school
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Environment-Specific Configurations

### Development (.env)
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Production (.env.production)
```env
DATABASE_URL="your-production-db-url"
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
      - run: npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
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
- [ ] Run database migrations on production
- [ ] Test authentication flow
- [ ] Verify all role dashboards load correctly
- [ ] Check dark/light mode toggle
- [ ] Test responsive layout on mobile
- [ ] Verify error boundaries work
- [ ] Run accessibility audit on production URL
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Configure custom domain (optional)

## Troubleshooting

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check firewall/network rules
- Ensure database accepts connections from Vercel IPs

### NextAuth Errors
- Verify `AUTH_SECRET` is set and matches
- Check `NEXTAUTH_URL` matches deployment URL
- Ensure callback URLs are configured

### Build Failures
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all imports resolve correctly