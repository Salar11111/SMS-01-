<div align="center">

# 🏫 Harbor School Management

**One campus, four roles, and every school-day workflow in a single app.**

[![CI](https://github.com/Salar11111/SMS-01-/actions/workflows/ci.yml/badge.svg)](https://github.com/Salar11111/SMS-01-/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-111827?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-16A34A)

</div>

---

## ✨ Why Harbor?

School tools usually split into four different logins: one for the office, one for teachers, one for students and one for parents. Harbor keeps the whole loop in one place. Administrators manage people and academic structure, teachers take attendance and fill the gradebook, students see their own progress, and parents follow their children — all behind role-aware route protection.

The boring parts are done properly: Zod validation on every Server Action, security headers, failed-login lockout, error boundaries, and a test suite that includes an accessibility scan. It is a small, readable Next.js codebase rather than a monorepo.

### 🧩 What's inside

| Role | Capabilities |
| --- | --- |
| **Admin** | User management, academic years, classes, subjects, teacher assignments, enrollment history, parent linking, reports, audit log |
| **Teacher** | Class overview, attendance tracking, gradebook management, assignments for the subjects they teach |
| **Student** | Enrolled classes, attendance rate, grade viewing |
| **Parent** | Children's enrollments, attendance and academic progress |

- 🛡️ **Route protection** — `src/proxy.ts` gates every route, and each role layout checks the session again.
- 🧾 **Validated mutations** — Zod schemas on every Server Action.
- 🔒 **Failed-login lockout** — five attempts, then fifteen minutes, per email.
- 🎨 **Design system** — light/dark mode, Playfair Display + Inter, and a warm sage/terracotta palette.
- ♿ **Accessible by default** — labeled fields, semantic regions and a Playwright axe check.
- 📊 **Reports** — enrollment, attendance and academic reporting for administrators.

---

## 🚀 Quick start

```bash
git clone <repository-url>
cd school-management
npm install
cp .env.example .env          # set MONGODB_URI and AUTH_SECRET
npm run db:seed               # MongoDB must be running
npm run dev
```

Visit `http://localhost:3000`. Generate a real `AUTH_SECRET` with `openssl rand -base64 32`.

> 🪟 **Windows note** — use `copy .env.example .env` if `cp` is not available.

### Demo accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@school.edu` | `password123` |
| Teacher | `teacher@school.edu` | `password123` |
| Student | `student@school.edu` | `password123` |
| Parent | `parent@school.edu` | `password123` |

> **Production warning:** rotate all credentials before deploying. Never run `db:seed` against a production database.

---

## 🧱 Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions, `src/proxy.ts`) |
| Language | TypeScript 5 (strict) |
| Database | MongoDB via Mongoose |
| Authentication | NextAuth.js v5 (Credentials provider, JWT sessions) |
| Styling | Tailwind CSS v4 with CSS custom properties |
| Validation | Zod v4 |
| Unit tests | Vitest + React Testing Library |
| E2E / a11y | Playwright + axe-core |
| Icons | Lucide React |

---

## 🗂 Project structure

```text
src/
├── proxy.ts                     # Next.js 16 proxy (route protection)
├── app/
│   ├── login/                   # Authentication
│   ├── admin/                   # Users, classes, enrollment, reports
│   ├── teacher/                 # Attendance and gradebook
│   ├── student/                 # Personal attendance and grades
│   ├── parent/                  # Children's attendance and grades
│   └── api/auth/[...nextauth]/  # NextAuth route
├── components/                  # UI library, providers, login form, tests
├── lib/
│   ├── auth.ts / auth.config.ts # Session, role guards, login lockout
│   ├── rbac.ts / actions.ts     # Roles and every Server Action
│   ├── models.ts / schemas.ts   # Mongoose models and Zod schemas
│   └── school.ts / utils.ts     # Enrollment, terms, reports, helpers
└── vitest.d.ts
tests/
└── a11y.spec.ts                 # Playwright accessibility tests
```

---

## 🔐 Security notes

- **Authentication** — JWT sessions, bcrypt cost 12, credentials provider.
- **Authorization** — `src/proxy.ts` requires a signed-in session; role layouts and Server Actions check the role again, and the session role is refreshed from the database.
- **Rate limiting** — five failed logins trigger a fifteen-minute lockout per email; login errors stay generic.
- **Input validation** — Zod on every mutation path.
- **Headers** — X-Frame-Options DENY, `nosniff`, Referrer-Policy, HSTS, Permissions-Policy.
- **Open redirects** — `isSafeCallbackUrl()` validates same-origin callbacks.
- **Secrets** — `.env` is gitignored; only `.env.example` is tracked.

---

## ✅ Tests & quality

```bash
npm run dev            # Development server
npm run build          # Production build
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm run format         # Prettier
npm run ci             # lint + typecheck + test

npm test               # Unit tests (Vitest)
npm run test:watch     # Watch mode
npm run test:e2e       # Playwright E2E + accessibility
```

Coverage includes RBAC, Zod schemas, enrollment history and utilities in `src/lib/__tests__/`, the UI component library, a teacher attendance flow, and axe-core scans of the home, login and admin pages.

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel deployment, MongoDB setup, environment variables and the CI pipeline. Quick version: import the repo in Vercel, set `MONGODB_URI`, `AUTH_SECRET` and `NEXTAUTH_URL`, deploy, then run `npm run db:seed` to populate initial data. MongoDB Atlas suits serverless; self-hosted MongoDB gives full control.

---

## ♿ Accessibility

Follows WCAG 2.1 AA: semantic landmarks, ARIA labels on interactive elements, visible focus indicators, ≥ 4.5:1 contrast, `prefers-reduced-motion` support and full keyboard navigation.

---

## 🗺 Roadmap ideas

- 📨 Notifications for new grades and attendance warnings
- 📅 Timetable and event calendar
- 📄 Report exports
- 🔍 Global search across people, classes and reports

---

<div align="center">

MIT licensed. Built with Next.js, MongoDB and a healthy respect for role checks.

</div>
