"use client";

import { cn } from "@/lib/cn";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Moon,
  Sun,
  X,
  XCircle,
} from "lucide-react";
import { type ComponentProps, forwardRef } from "react";
import Link from "next/link";
import { formatRole, type AppRole } from "@/lib/rbac";
import { signOutAction } from "@/lib/actions/signout";

/* ── Button ── */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-sage-hover)] hover:shadow-lg hover:-translate-y-0.5",
  secondary:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-transparent hover:bg-[var(--color-sage-light)] hover:shadow-md hover:-translate-y-0.5",
  ghost:
    "text-[var(--color-slate-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)] hover:shadow-sm",
  danger:
    "bg-[var(--color-error)] text-white hover:shadow-lg hover:-translate-y-0.5",
  outline:
    "border border-[var(--color-line)] text-[var(--color-slate)] bg-transparent hover:bg-[var(--color-surface)] hover:border-[var(--color-line-strong)] hover:shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

/* ── Input ── */
export interface InputProps extends ComponentProps<"input"> {
  error?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, icon, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-slate-light)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-field",
              icon && "pl-10",
              error && "input-error",
              className,
            )}
            {...props}
          />
        </div>
        {error && helperText ? (
          <p className="input-error-text">{helperText}</p>
        ) : helperText ? (
          <p className="input-helper">{helperText}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

/* ── DataTable ── */
export interface DataTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  loading?: boolean;
  onRowClick?: (rowIndex: number) => void;
}

export function DataTable({
  headers,
  rows,
  loading,
  onRowClick,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            {headers.map((_, j) => (
              <div key={j} className="h-10 flex-1 shimmer-bg" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        message="No records yet."
        icon={<Info className="h-6 w-6 text-[var(--color-slate-light)]" />}
      />
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-line)]">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 font-semibold text-[var(--color-slate)] text-xs uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-[var(--color-line)]/60 last:border-0 transition-colors",
                onRowClick && "cursor-pointer hover:bg-[var(--color-sage-lighter)]",
                i % 2 === 1 && "bg-[var(--color-surface)]/50",
              )}
              onClick={onRowClick ? () => onRowClick(i) : undefined}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[var(--color-ink)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Panel ── */
export interface PanelProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "outlined" | "accent";
}

export function Panel({ title, action, children, variant = "default" }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[var(--shadow-panel)]",
        variant === "outlined" && "border-2 shadow-none bg-transparent",
        variant === "accent" && "border-t-4 border-t-[var(--color-primary)]",
      )}
    >
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-5 pb-4 pt-5">
          {title && (
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              {title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn(title || action ? "p-5" : "p-5")}>{children}</div>
    </section>
  );
}

/* ── Stat ── */
export interface StatProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon?: React.ReactNode;
}

export function Stat({ label, value, trend, trendLabel, icon }: StatProps) {
  const trendColors = {
    up: "text-[var(--color-success)] bg-[var(--color-success-soft)]",
    down: "text-[var(--color-error)] bg-[var(--color-error-soft)]",
    neutral: "text-[var(--color-slate-muted)] bg-[var(--color-surface)]",
  };
  const trendIcons = { up: "↑", down: "↓", neutral: "→" };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-slate-muted)]">{label}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                trendColors[trend],
              )}
            >
              {trendIcons[trend]} {trendLabel ?? trend}
            </span>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Badge ── */
export interface BadgeProps {
  variant?: "primary" | "success" | "warning" | "error" | "info" | "neutral";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "info", children, className }: BadgeProps) {
  return (
    <span className={cn("badge", `badge-${variant}`, className)}>
      {children}
    </span>
  );
}

/* ── Avatar ── */
export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function getAvatarBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = (Math.abs(hash) % 6) + 1;
  return `avatar-bg-${index}`;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shadow-sm",
        sizeMap[size],
        getAvatarBg(name),
        className,
      )}
    >
      {initials}
    </div>
  );
}

/* ── Skeleton ── */
export function Skeleton({
  className,
  width,
  height,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      className={cn("shimmer-bg rounded-lg", className)}
      style={{ width, height }}
    />
  );
}

/* ── Card ── */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-card)] transition-all duration-300",
        hover &&
          "hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 hover:border-[var(--color-line-strong)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── EmptyState ── */
export interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface)]">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-[var(--color-slate-muted)]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Alert ── */
export interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
  onDismiss?: () => void;
}

const alertIcons = {
  info: <Info className="h-5 w-5 text-[var(--color-info)]" />,
  success: <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />,
  warning: <XCircle className="h-5 w-5 text-[var(--color-warning)]" />,
  error: <AlertCircle className="h-5 w-5 text-[var(--color-error)]" />,
};

const alertStyles = {
  info: "bg-[var(--color-info-soft)] border-[var(--color-info)]/20",
  success: "bg-[var(--color-success-soft)] border-[var(--color-success)]/20",
  warning: "bg-[var(--color-warning-soft)] border-[var(--color-warning)]/20",
  error: "bg-[var(--color-error-soft)] border-[var(--color-error)]/20",
};

export function Alert({ type = "info", children, onDismiss }: AlertProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 animate-slide-down",
        alertStyles[type],
      )}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{alertIcons[type]}</span>
      <p className="text-sm text-[var(--color-ink)]">{children}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-[var(--color-slate-muted)]" />
        </button>
      )}
    </div>
  );
}

/* ── Modal ── */
export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onOpenChange, title, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg mx-4 animate-scale-in rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[var(--shadow-xl)]">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
          <h3 className="text-lg font-semibold text-[var(--color-ink)] font-[family-name:var(--font-display)]">
            {title}
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 hover:bg-[var(--color-surface)] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-[var(--color-slate-muted)]" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-[var(--color-line)] px-6 py-4 bg-[var(--color-surface)] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PageHeader ── */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-[var(--color-slate-muted)]">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ── Field ── */
export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="input-label">{label}</span>
      {children ?? (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          className="input-field"
        />
      )}
    </label>
  );
}

/* ── SubmitButton ── */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="submit" className="btn-primary">
      {children}
    </button>
  );
}

/* ── Toast ── */
export interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  type?: "info" | "success" | "warning" | "error";
}

export function Toast({ open, onOpenChange, title, description, type = "info" }: ToastProps) {
  if (!open) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <Alert type={type} onDismiss={() => onOpenChange(false)}>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-[var(--color-slate-muted)]">{description}</p>
      </Alert>
    </div>
  );
}

/* ── SectionLabel ── */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-[var(--color-terracotta)]" />
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
        {children}
      </span>
    </div>
  );
}

/* ── DashboardShell ── */
export function DashboardShell({
  title,
  role,
  userName,
  nav,
  children,
}: {
  title: string;
  role: AppRole;
  userName: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header aria-label={title} className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-panel)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105">
              H
            </div>
            <span className="hidden font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-ink)] sm:inline">
              Harbor School
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next =
                  document.documentElement.dataset.theme === "dark"
                    ? "light"
                    : "dark";
                document.documentElement.dataset.theme = next;
              }}
              className="rounded-xl p-2 text-[var(--color-slate-muted)] transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] py-1 pl-1 pr-3 sm:flex">
              <Avatar name={userName} size="sm" />
              <span className="max-w-[100px] truncate text-sm font-medium text-[var(--color-ink)]">
                {userName}
              </span>
              <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                {formatRole(role)}
              </span>
            </div>
            <form action={signOutAction}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <nav className="border-t border-[var(--color-line)]">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 md:overflow-visible">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-slate-muted)] transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
