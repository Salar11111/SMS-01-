<div align="center">

# Harbor School Management

A full-stack school management system built with **Next.js 16**, featuring role-based access control for administrators, teachers, students, and parents.

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](.github/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/tests-67%20passing-brightgreen)

</div>

---

## Features

| Role | Capabilities |
|------|-------------|
| **Admin** | User management, academic years, classes, subjects, teacher assignments, enrollment, parent linking, reports |
| **Teacher** | Class overview, attendance tracking, gradebook management, assignment creation |
| **Student** | Enrolled classes, attendance rate, grade viewing |
| **Parent** | Children's enrollments, attendance, and academic progress |

**Cross-cutting:**
- Multi-role authentication with NextAuth.js v5, bcrypt hashing (cost 12), and IP-aware rate limiting
- Route protection via Next.js 16 proxy (edge middleware)
- Zod v4 validation on every Server Action and API route
- Security headers (CSP-ready, HSTS, X-Frame-Options, nosniff)
- Error boundaries + loading skeletons for every route segment
- Custom design system with light/dark mode, Playfair Display + Inter typography
- Responsive layout with warm sage/terracotta palette
- OG metadata, robots.txt, sitemap.xml
- WCAG 2.1 AA: semantic HTML, ARIA labels, focus management, keyboard navigation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, middleware.ts) |
| Language | TypeScript 5 (strict mode) |
| Database | MongoDB via Mongoose ODM |
| Authentication | NextAuth.js v5 beta (Credentials provider, JWT sessions) |
| Styling | Tailwind CSS v4 with CSS custom properties |
| Validation | Zod v4 |
| Unit tests | Vitest + React Testing Library (67 tests) |
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
npm run build            # Prisma generate + Next.js build
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
├── middleware.ts           # Next.js 16 edge middleware (route protection)
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   ├── page.tsx                # Marketing landing page
│   ├── error.tsx               # Global error boundary
│   ├── global-error.tsx        # Root layout error boundary
│   ├── not-found.tsx           # 404 page
│   ├── robots.ts               # robots.txt
│   ├── sitemap.ts              # sitemap.xml
│   ├── login/                  # Authentication (page, error, loading)
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
│   ├── auth.ts                 # NextAuth configuration
│   ├── auth.config.ts          # Auth options (pages, session, callbacks)
│   ├── authz.ts                # requireUser/requireRole + typed errors
│   ├── prisma.ts               # MongoDB data access layer (Mongoose models)
│   ├── models/                 # Mongoose model schemas
│   ├── rbac.ts                 # Role definitions + path rules
│   ├── rate-limit.ts           # Login rate limiting (5 attempts / 15 min)
│   ├── schemas.ts              # Zod validation schemas
│   ├── api-validation.ts       # API route validation middleware
│   ├── validation.ts           # Shared form parsing helpers
│   ├── utils.ts                # Utility functions (formatting, safe redirects)
│   ├── cn.ts                   # className utility
│   └── actions/                # Server Actions
│       ├── admin.ts            # Admin mutations (CRUD users, classes, etc.)
│       ├── teacher.ts          # Teacher mutations (attendance, grades)
│       └── signout.ts          # Sign out action
├── models/
│   └── index.ts                # Mongoose model barrel export
└── vitest.d.ts                 # Vitest global type declarations

tests/
└── a11y.spec.ts                # Playwright accessibility tests (axe-core)

prisma/
├── schema.prisma               # Data model (11 models)
├── seed.ts                     # Demo data seeder
└── migrations/                 # Migration history
```

### Folder Structure Assessment

**What's good:**
- Clear separation: `app/` (routes), `components/` (UI), `lib/` (business logic)
- Tests co-located with source (`__tests__/` folders)
- Server Actions grouped by domain (`actions/admin.ts`, `actions/teacher.ts`)
- One shared UI module keeps the component API consistent

**What could be improved (noted, not blocking):**
- `ui.tsx` is 644 lines / ~20 components — could split into `components/ui/` directory
- Three overlapping auth modules (`auth.ts`, `auth.config.ts`, `authz.ts`) — responsibilities are clear but could be consolidated
- No `src/types/` for shared TypeScript interfaces (types live next to their source)

## Security

- **Authentication**: JWT sessions, bcrypt cost 12, credentials provider
- **Authorization**: Edge middleware checks every route; Server Actions re-verify via `requireRole()`
- **Rate limiting**: 5 failed login attempts → 15-minute lockout (per-email)
- **Input validation**: Zod schemas on every mutation path
- **Headers**: X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS, Permissions-Policy
- **Open redirect prevention**: `isSafeCallbackUrl()` validates same-origin
- **No SQL injection**: 100% typed Mongoose queries (zero raw queries)
- **Secrets**: `.env` gitignored; only `.env.example` tracked

## Testing

```bash
# Unit tests (67 tests, 7 files)
npm test

# E2E + accessibility (requires: npx playwright install chromium)
npm run test:e2e
```

**Test coverage areas:**
- `src/lib/__tests__/` — RBAC, Zod schemas, utility functions
- `src/components/__tests__/` — Button, Input, Stat, UI component library
- `tests/a11y.spec.ts` — axe-core accessibility scans (home, login, admin)

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for full instructions covering:
- Vercel deployment
- Docker with standalone output
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
