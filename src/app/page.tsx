import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { ROLE_HOME } from "@/lib/rbac";
import { Badge, SectionLabel } from "@/components/ui";
import {
  CalendarCheck,
  FileSignature,
  GraduationCap,
  Heart,
  School,
  Shield,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  const [classes, teachers, students] = await Promise.all([
    db.class_count(),
    db.teacherProfile_count(),
    db.studentProfile_count(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-panel)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] shadow-sm">
              <School className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
                Harbor School
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-slate-muted)]">
                Management Suite
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[var(--color-slate-muted)] transition-colors hover:text-[var(--color-ink)]">
              Features
            </a>
            <a href="#roles" className="text-sm font-medium text-[var(--color-slate-muted)] transition-colors hover:text-[var(--color-ink)]">
              For Everyone
            </a>
            <a href="#journey" className="text-sm font-medium text-[var(--color-slate-muted)] transition-colors hover:text-[var(--color-ink)]">
              How It Works
            </a>
            <a href="#stories" className="text-sm font-medium text-[var(--color-slate-muted)] transition-colors hover:text-[var(--color-ink)]">
              Stories
            </a>
          </nav>
          <Link href="/login" className="btn-primary">
            Enter Portal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[var(--color-sage-light)] blur-3xl opacity-60" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[var(--color-terracotta-light)] blur-3xl opacity-40" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm font-medium text-[var(--color-slate-muted)] shadow-sm">
              <Sparkles className="h-4 w-4 text-[var(--color-terracotta)]" />
              Welcome to Harbor School
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-tight tracking-tight text-[var(--color-ink)] lg:text-6xl">
              Where learning{" "}
              <em className="text-[var(--color-primary)] italic">feels</em>{" "}
              like belonging.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-slate-muted)]">
              From enrollment to graduation, Harbor School connects
              administrators, teachers, students, and parents in one warm
              workspace — so every child is supported, never overlooked.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login" className="btn-primary px-7 py-3 text-base">
                Enter the portal <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="btn-outline px-7 py-3 text-base">
                Explore features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-[var(--color-slate-muted)]">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--color-primary)]" />
                Role-based access
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                Real-time updates
              </span>
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[var(--color-primary)]" />
                Built for every role
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 shadow-[var(--shadow-xl)]">
              {/* Floating stats */}
              <div className="absolute -top-5 -right-5 flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 shadow-[var(--shadow-lg)] animate-float">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-success-soft)]">
                  <CalendarCheck className="h-5 w-5 text-[var(--color-success)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-ink)]">Attendance saved</p>
                  <p className="text-xs text-[var(--color-slate-muted)]">Grade 10 — Section B</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Mock dashboard cards */}
                <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-soft)]">
                    <GraduationCap className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-ink)]">{students} Students Enrolled</p>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                      <div className="h-full w-3/4 rounded-full bg-[var(--color-primary)]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-terracotta-light)]">
                    <Users className="h-6 w-6 text-[var(--color-terracotta)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-ink)]">{teachers} Teachers Active</p>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                      <div className="h-full w-2/3 rounded-full bg-[var(--color-terracotta)]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-info-soft)]">
                    <School className="h-6 w-6 text-[var(--color-info)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-ink)]">{classes} Classes Running</p>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                      <div className="h-full w-1/2 rounded-full bg-[var(--color-info)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating satisfaction badge */}
              <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-4 shadow-[var(--shadow-lg)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-terracotta-light)]">
                  <Heart className="h-5 w-5 text-[var(--color-terracotta)] fill-current" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-ink)] font-[family-name:var(--font-display)]">98%</p>
                  <p className="text-xs text-[var(--color-slate-muted)]">parent satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-3 gap-6 px-6 py-6">
            <div className="text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">{classes}</p>
              <p className="text-sm text-[var(--color-slate-muted)]">Classes</p>
            </div>
            <div className="text-center border-x border-[var(--color-line)]">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">{teachers}</p>
              <p className="text-sm text-[var(--color-slate-muted)]">Teachers</p>
            </div>
            <div className="text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">{students}</p>
              <p className="text-sm text-[var(--color-slate-muted)]">Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-[var(--color-panel)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <SectionLabel>What we offer</SectionLabel>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)]">
              Built for every chapter
            </h2>
            <p className="mt-3 text-lg text-[var(--color-slate-muted)]">
              Purpose-built modules that keep your school running smoothly — from
              enrollment to graduation.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <GraduationCap className="h-6 w-6" />,
                title: "Enrollment Management",
                desc: "Create student and staff accounts, assign classes, and manage the academic year — all from a single dashboard.",
                color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
              },
              {
                icon: <CalendarCheck className="h-6 w-6" />,
                title: "Attendance Tracking",
                desc: "Mark presence, track trends, and generate per-class or school-wide attendance reports in seconds.",
                color: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
              },
              {
                icon: <FileSignature className="h-6 w-6" />,
                title: "Grades & Assignments",
                desc: "Create assignments, enter scores, and view gradebooks — with role-based access so each stakeholder sees what they need.",
                color: "bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Role-Based Portals",
                desc: "Dedicated dashboards for admins, teachers, students, and parents — each sees only what they need.",
                color: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Secure & Compliant",
                desc: "Password hashing, rate limiting, and server-side authorization keep every role's data safe.",
                color: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
              },
              {
                icon: <Heart className="h-6 w-6" />,
                title: "Parent Engagement",
                desc: "Parents stay connected to their children's academic journey with real-time access to grades and attendance.",
                color: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
              },
            ].map((feature, i) => (
              <div key={i} className="card card-hover p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--color-ink)]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-slate-muted)]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="py-24 gradient-warm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <SectionLabel>Who it&apos;s for</SectionLabel>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)]">
              Four roles, one connected school
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--color-slate-muted)]">
              Everyone gets a workspace tailored to them — with the right data at
              the right time.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                role: "Admin",
                icon: <Shield className="h-6 w-6" />,
                desc: "Manage users, classes, enrollment, and reports.",
                color: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
                border: "border-[var(--color-primary)]/20",
              },
              {
                role: "Teacher",
                icon: <FileSignature className="h-6 w-6" />,
                desc: "Mark attendance, manage grades, view classes.",
                color: "bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]",
                border: "border-[var(--color-terracotta)]/20",
              },
              {
                role: "Student",
                icon: <GraduationCap className="h-6 w-6" />,
                desc: "View classes, grades, and attendance history.",
                color: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
                border: "border-[var(--color-info)]/20",
              },
              {
                role: "Parent",
                icon: <Heart className="h-6 w-6" />,
                desc: "Track your child's progress across all subjects.",
                color: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
                border: "border-[var(--color-success)]/20",
              },
            ].map((r, i) => (
              <div key={i} className={`card card-hover p-6 border ${r.border}`}>
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${r.color}`}>
                  {r.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                  {r.role}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-slate-muted)]">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="journey" className="py-24 bg-[var(--color-panel)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)]">
              Your path to connected education
            </h2>
            <p className="mt-3 text-lg text-[var(--color-slate-muted)]">
              Four gentle steps, one connected team. We designed every stage to feel
              less like a system and more like a welcome.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Set up your school",
                desc: "Admins create academic years, classes, and subjects in minutes.",
                icon: <School className="h-5 w-5" />,
              },
              {
                step: "2",
                title: "Assign your team",
                desc: "Link teachers to class-subject pairs and enroll students.",
                icon: <Users className="h-5 w-5" />,
              },
              {
                step: "3",
                title: "Track daily progress",
                desc: "Teachers mark attendance and enter grades in real time.",
                icon: <CalendarCheck className="h-5 w-5" />,
              },
              {
                step: "4",
                title: "Stay connected",
                desc: "Students and parents see grades and attendance instantly.",
                icon: <Heart className="h-5 w-5" />,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <div className="h-px flex-1 bg-[var(--color-line)]" />
                </div>
                <div className="flex items-center gap-2 mb-2 text-[var(--color-primary)]">
                  {item.icon}
                  <h3 className="font-semibold text-[var(--color-ink)]">{item.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-slate-muted)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--color-primary)] p-12 text-center text-white shadow-[var(--shadow-xl)]">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Your portal to connected education
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold lg:text-5xl">
                Ready when you are.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                Your school&apos;s records, grades, and attendance — gathered in one warm,
                welcoming place. Step through the portal and feel the difference.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[var(--color-primary)] shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  Enter Portal <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                Secure · Compliant · Always Available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]">
                  <School className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-ink)]">
                    Harbor School
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-slate-muted)]">
                    Management Suite
                  </span>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-slate-muted)]">
                A school built around people — connected records, kind educators,
                and learning that feels like belonging.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-slate)]">
                Explore
              </h4>
              <ul className="space-y-3 text-sm text-[var(--color-slate-muted)]">
                <li><a href="#features" className="transition-colors hover:text-[var(--color-ink)]">Features</a></li>
                <li><a href="#roles" className="transition-colors hover:text-[var(--color-ink)]">Roles</a></li>
                <li><a href="#journey" className="transition-colors hover:text-[var(--color-ink)]">How it works</a></li>
                <li><Link href="/login" className="transition-colors hover:text-[var(--color-ink)]">Sign in</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-slate)]">
                Support
              </h4>
              <ul className="space-y-3 text-sm text-[var(--color-slate-muted)]">
                <li><span className="flex items-center gap-2"><Shield className="h-4 w-4 text-[var(--color-primary)]" /> Role-based access</span></li>
                <li><span className="flex items-center gap-2"><Heart className="h-4 w-4 text-[var(--color-terracotta)]" /> Built with care</span></li>
                <li><span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[var(--color-info)]" /> Real-time updates</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-line)] pt-8 sm:flex-row">
            <p className="text-sm text-[var(--color-slate-muted)]">
              © {new Date().getFullYear()} Harbor School Management. All rights reserved.
            </p>
            <Badge variant="primary">
              <Shield className="h-3 w-3" /> Role-Based Access
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}
