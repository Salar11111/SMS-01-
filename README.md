<div align="center">

# Harbor School Management

A full-stack school management system built with **Next.js 16**, featuring role-based access control for administrators, teachers, students, and parents.

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](.github/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-brightgreen)

</div>

---

## Features

| Role | Capabilities |
|------|-------------|
| **Admin** | User management, academic years, classes, subjects, teacher assignments, enrollment history, parent linking, reports, audit log |
| **Teacher** | Class overview, attendance tracking, gradebook management, assignments for the subjects they teach |
| **Student** | Enrolled classes, attendance rate, grade viewing |
| **Parent** | Children's enrollments, attendance, and academic progress |

**Cross-cutting:**
- Route protection in `src/proxy.ts`, with each role layout checking the session again
- Zod validation on every Server Action
- Security headers (HSTS, X-Frame-Options, nosniff)
- Failed-login lockout: 5 attempts, then 15 minutes, per email
- Error boundaries and loading states for route segments
- Custom design system with light/dark mode, Playfair Display + Inter typography
- Responsive layout with warm sage/terracotta palette
- OG metadata
- Labeled sign-in fields, semantic page regions, and a Playwright axe check for the home and login pages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, `src/proxy.ts`) |
| Language | TypeScript 5 (strict mode) |
| Database | MongoDB via Mongoose |
| Authentication | NextAuth.js v5 (Credentials provider, JWT sessions) |
| Styling | Tailwind CSS v4 with CSS custom properties |
| Validation | Zod v4 |
| Unit tests | Vitest + React Testing Library |
| E2E / a11y | Playwright + axe-core |
| Icons | Lucide React |

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd school-management
npm install

# Configure environment
cp .env.example .env
# Generate a real secret: openssl rand -base64 32

# Set up MongoDB
npm install
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000`

### Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@school.edu` | `password123` |
| Teacher | `teacher@school.edu` | `password123` |
| Student | `student@school.edu` | `password123` |
| Parent | `parent@school.edu` | `password123` |

> **Production warning:** Rotate all credentials before deploying. Never run `db:seed` against a production database.

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Next.js production build
npm run start            # Start production server

# Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript type checking (tsc --noEmit)
npm run format           # Prettier format all files
npm run format:check     # Check formatting
npm run ci               # lint + typecheck + test (full gate)

# Testing
npm test                 # Run unit tests (Vitest)
npm run test:watch       # Watch mode
npm run test:ui          # Interactive UI
npm run test:e2e         # Playwright E2E + accessibility
npm run test:e2e:ui      # Playwright UI mode

# Database
npm run db:seed          # Seed demo data
npm run db:reset         # Reset + re-seed
```

## Project Structure

```
src/
├── proxy.ts                # Next.js 16 proxy (route protection)
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   ├── page.tsx                # Marketing landing page
│   ├── error.tsx               # Global error boundary
│   ├── global-error.tsx        # Root layout error boundary
│   ├── not-found.tsx           # 404 page
│   ├── login/                  # Authentication
│   ├── admin/                  # Admin dashboard
│   │   ├── classes/            # Class management
│   │   ├── enrollment/         # Student enrollment
│   │   ├── reports/            # Reports & analytics
│   │   └── users/              # User management
│   ├── teacher/                # Teacher portal
│   │   ├── attendance/         # Attendance tracking ([classId] detail)
│   │   └── grades/             # Gradebook ([classId] detail)
│   ├── student/                # Student portal
│   │   ├── attendance/         # Personal attendance
│   │   └── grades/             # Personal grades
│   ├── parent/                 # Parent portal
│   │   ├── attendance/         # Children's attendance
│   │   └── grades/             # Children's grades
│   └── api/auth/[...nextauth]/ # NextAuth API route
├── components/
│   ├── ui.tsx                  # Component library (Button, DataTable, Panel, etc.)
│   ├── providers.tsx           # Theme + session providers
│   ├── login-form.tsx          # Login form
│   └── __tests__/              # Component tests
├── lib/
│   ├── auth.ts                 # Session, role guards, login lockout
│   ├── auth.config.ts          # Edge-safe auth options for proxy.ts
│   ├── rbac.ts                 # Role names and navigation
│   ├── actions.ts              # Every server action
│   ├── models.ts               # Every Mongoose model
│   ├── prisma.ts               # Database queries
│   ├── school.ts               # Enrollment, terms, and reports
│   ├── schemas.ts              # Zod validation schemas
│   ├── seed.ts
│   └── utils.ts                # Formatting and safe redirects
└── vitest.d.ts                 # Vitest global type declarations

tests/
└── a11y.spec.ts                # Playwright accessibility tests (axe-core)
```

### Folder Structure Assessment

**What's good:**
- Clear separation: `app/` (routes), `components/` (UI), `lib/` (business logic)
- Tests co-located with source (`__tests__/` folders)
- One actions file, one models file, and one school file instead of a folder per concern
- `auth.config.ts` stays separate so route protection does not load the database

## Security

- **Authentication**: JWT sessions, bcrypt cost 12, credentials provider
- **Authorization**: `src/proxy.ts` requires a signed-in session. Role layouts and Server Actions check the role again, and the session role is refreshed from the database.
- **Rate limiting**: 5 failed login attempts → 15-minute lockout (per email). Login errors stay generic.
- **Input validation**: Zod schemas on every mutation path
- **Headers**: X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS, Permissions-Policy
- **Open redirect prevention**: `isSafeCallbackUrl()` validates same-origin
- **Queries**: Mongoose queries with string ids. No raw query strings from request input.
- **Secrets**: `.env` gitignored; only `.env.example` tracked

## Testing

```bash
# Unit tests
npm test

# Mongo round-trip for enrollment history. CI sets this against its Mongo service.
# MONGO_INTEGRATION=1 MONGODB_URI=mongodb://127.0.0.1:27017/school-management npm test

# E2E + accessibility (requires: npx playwright install chromium)
npm run test:e2e
```

**Test coverage areas:**
- `src/lib/__tests__/` — RBAC, Zod schemas, enrollment history, utility functions
- `src/components/__tests__/` — Button, Input, Stat, UI component library
- `tests/attendance.spec.ts` — teacher sign-in and saving attendance
- `tests/a11y.spec.ts` — axe-core accessibility scans (home, login, admin)

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for full instructions covering:
- Vercel deployment
- MongoDB setup and seed strategies
- Environment variable configuration
- GitHub Actions CI pipeline

### Quick deploy (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Set env vars: `MONGODB_URI`, `AUTH_SECRET`, `NEXTAUTH_URL`
4. Deploy
5. Run `npm run db:seed` to populate initial data

### Database

| Provider | Type | Best for |
|----------|------|----------|
| MongoDB Atlas | Document | Serverless, Vercel |
| Self-hosted MongoDB | Document | Full control |

## Accessibility

Follows WCAG 2.1 AA guidelines:
- Semantic HTML and landmark regions
- ARIA labels on all interactive elements
- Visible focus indicators
- Color contrast ratios ≥ 4.5:1
- `prefers-reduced-motion` support
- Full keyboard navigation

## License

MIT License — see [LICENSE](LICENSE) for details.
