# Harbor School Management

A role-based school management web app for **enrollment**, **attendance**, and **grades**. Built with Next.js, TypeScript, Tailwind CSS, Prisma, SQLite, and NextAuth.

## What this project is

Harbor School Management gives four roles a shared place to run day-to-day school operations:

| Role | What they can do |
|------|------------------|
| **Admin** | Manage users, academic years, classes, subjects, enrollments, parent–student links, and reports |
| **Teacher** | Take attendance and manage the gradebook for assigned classes/subjects |
| **Student** | View own classes, attendance, and grades |
| **Parent** | View linked children’s attendance and grades |

**Phase 1 (implemented):** enrollment, attendance, grades, RBAC dashboards  
**Phase 2 (planned):** teacher–parent messaging, class scheduling

---

## Prerequisites

Before you start, install:

1. **Node.js** 20 or newer (this project was developed on Node 24)
2. **npm** (comes with Node.js)

Check your versions:

```bash
node -v
npm -v
```

---

## Step 1 — Open the project

If you already have this folder:

```bash
cd "C:\Users\DAR LAPTOPS\school-management"
```

Or clone/copy the project into a directory of your choice, then `cd` into it.

---

## Step 2 — Install dependencies

From the project root:

```bash
npm install
```

This installs Next.js, React, Prisma, NextAuth, bcryptjs, Tailwind, and related packages.

---

## Step 3 — Environment setup

1. Copy the example env file:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

2. Open `.env` and confirm (or edit) these values:

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite file path (relative to `prisma/`) | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Secret used to sign sessions | long random string |
| `AUTH_SECRET` | Same secret for Auth.js v5 | same as above |
| `NEXTAUTH_URL` | App URL in the browser | `http://localhost:3000` |

For local development, the committed `.env.example` defaults are enough. Change the secrets before any public deployment.

---

## Step 4 — Create the database

Generate the Prisma client, apply migrations, and seed demo data:

```bash
npx prisma migrate dev
npx prisma db seed
```

What each command does:

1. **`prisma migrate dev`** — creates/updates `prisma/dev.db` from `prisma/schema.prisma` and applies SQL migrations under `prisma/migrations/`.
2. **`prisma db seed`** — runs `prisma/seed.ts`, which creates demo users, a class, enrollment, sample attendance, and a grade.

Useful shortcuts (also in `package.json`):

```bash
npm run db:migrate
npm run db:seed
npm run db:reset
```

`db:reset` wipes the database, re-applies migrations, and re-seeds. Use it when you want a clean demo dataset.

---

## Step 5 — Run the app locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- The landing page introduces Harbor School.
- Click **Sign in**, or go directly to [http://localhost:3000/login](http://localhost:3000/login).

After a successful login you are redirected to the dashboard for your role (`/admin`, `/teacher`, `/student`, or `/parent`).

---

## Step 6 — Demo accounts

All seeded accounts use the password:

```text
password123
```

| Email | Role |
|-------|------|
| `admin@school.edu` | Admin |
| `teacher@school.edu` | Teacher |
| `student@school.edu` | Student |
| `parent@school.edu` | Parent |

The seed also creates:

- Academic year `2025-2026`
- Class `Grade 10 — Section A`
- Subjects: Mathematics, English, Science (assigned to the demo teacher)
- Student `Bob Student` enrolled in that class
- Parent `Carol Parent` linked to Bob
- One attendance record and one graded assignment

---

## How roles and access work

Route protection is enforced in two layers:

1. **Middleware** (`src/middleware.ts`) — redirects unauthenticated users to `/login`, and blocks cross-role URLs (e.g. a student cannot open `/admin`).
2. **Server actions** — admin/teacher mutations check the session role again, and teachers can only change classes they are assigned to.

| Area | Admin | Teacher | Student | Parent |
|------|-------|---------|---------|--------|
| Users / classes / subjects | Full | — | — | — |
| Enrollment & parent links | Full | — | — | — |
| Attendance | View via reports | Mark for assigned classes | Own only | Linked children |
| Grades | View via data | Gradebook for assigned classes | Own only | Linked children |
| Reports | Yes | — | — | — |

---

## Project structure

```text
school-management/
├── prisma/
│   ├── schema.prisma      # Database models
│   ├── seed.ts            # Demo data
│   ├── migrations/        # SQL migrations
│   └── dev.db             # Local SQLite DB (generated)
├── src/
│   ├── app/
│   │   ├── page.tsx       # Landing page
│   │   ├── login/         # Sign-in
│   │   ├── api/auth/      # NextAuth route handlers
│   │   ├── admin/         # Admin dashboard
│   │   ├── teacher/       # Teacher dashboard
│   │   ├── student/       # Student dashboard
│   │   └── parent/        # Parent dashboard
│   ├── components/        # Shared UI (shell, forms, tables)
│   ├── lib/
│   │   ├── auth.ts        # NextAuth + credentials
│   │   ├── auth.config.ts # Edge-safe auth config
│   │   ├── prisma.ts      # Prisma client singleton
│   │   ├── rbac.ts        # Role helpers
│   │   ├── utils.ts       # Date/class helpers
│   │   └── actions/       # Server actions (admin, teacher)
│   └── middleware.ts      # Auth + role route guards
├── .env.example
├── package.json
└── README.md
```

---

## Common workflows

### Admin enrolls a student

1. Sign in as `admin@school.edu`.
2. Open **Users** → create a user with role **Student** (optional Student ID).
3. Open **Classes** → ensure an academic year, class, and subjects exist; assign a teacher.
4. Open **Enrollment** → enroll the student in a class.
5. (Optional) Link a parent account to that student on the same page.

### Teacher marks attendance

1. Sign in as `teacher@school.edu`.
2. Open **Attendance** → choose a class.
3. Set the date and each student’s status (Present / Absent / Late / Excused).
4. Click **Save attendance**.

### Teacher enters grades

1. From **Grades** → open a class gradebook.
2. Create an assignment (title, subject, max score, optional due date).
3. Enter scores for enrolled students → **Save grades**.

### Parent views a child’s grades

1. Sign in as `parent@school.edu`.
2. Open **Grades** (or **Attendance**) to see data only for linked children.

### Student views own records

1. Sign in as `student@school.edu`.
2. Use **Overview**, **Attendance**, and **Grades** for read-only personal data.

---

## Scripts reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Run production server (after build) |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset DB, migrate, and seed |

---

## Troubleshooting

**“Invalid email or password”**  
Re-run `npx prisma db seed` and use the demo emails with `password123`.

**Database locked / SQLite errors**  
Stop all running `npm run dev` processes, then retry migrate/seed. Avoid opening `dev.db` in another tool while the app is writing.

**Auth / session issues after changing secrets**  
Clear site cookies for `localhost:3000`, confirm `AUTH_SECRET` / `NEXTAUTH_SECRET` are set, restart `npm run dev`.

**Port 3000 already in use**  
```bash
npx next dev -p 3001
```
Also update `NEXTAUTH_URL` in `.env` to match.

**Prisma client out of date**  
```bash
npx prisma generate
```

**Cannot access another role’s pages**  
Expected behavior. Each account is limited to its role home (`/admin`, `/teacher`, `/student`, `/parent`).

---

## Production notes

- Replace SQLite with PostgreSQL by changing `provider` and `DATABASE_URL` in Prisma, then re-migrate.
- Use a strong unique `AUTH_SECRET`.
- Do not commit real `.env` files or production credentials.
#   S M S - 0 1 -  
 