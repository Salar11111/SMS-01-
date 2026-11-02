import Link from "next/link";
import { PageHeader, Panel, DataTable, Stat } from "@/components/ui";
import { loadClassReport, percent } from "@/lib/school";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const { years, selected, totals, rows } = await loadClassReport(year);
  const exportHref = selected ? `/admin/reports/export?year=${selected.id}` : "/admin/reports/export";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Enrollment, attendance, and grade averages for one academic year. Present is present only. Late, absent, and excused are counted on their own."
      />
      <form className="flex flex-wrap items-end gap-3" action="/admin/reports">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[var(--color-ink)]">Academic year</span>
          <select
            name="year"
            defaultValue={selected?.id ?? ""}
            className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
          >
            {years.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.isActive ? " (active)" : ""}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-outline">
          Show year
        </button>
        <Link href={exportHref} className="btn-primary">
          Download CSV
        </Link>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Enrollments" value={totals.enrollment} />
        <Stat label="Present" value={percent(totals.present, totals.attendance)} />
        <Stat label="Late" value={totals.late} />
        <Stat label="Excused" value={totals.excused} />
      </div>
      <Panel title={selected ? selected.name : "No academic year"}>
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--color-slate-muted)]">No classes in this year.</p>
        ) : (
          <DataTable
            headers={["Class", "Year", "Students", "Present %", "Late", "Absent", "Excused", "Grade average"]}
            rows={rows.map((row) => [
              row.className,
              row.year,
              String(row.students),
              row.present,
              String(row.late),
              String(row.absent),
              String(row.excused),
              row.average,
            ])}
          />
        )}
      </Panel>
      {selected?.startDate || selected?.endDate ? (
        <p className="text-sm text-[var(--color-slate-muted)]">
          Attendance and grades are limited to {selected.startDate ? new Date(selected.startDate).toLocaleDateString() : "the start of the year"}
          {" – "}
          {selected.endDate ? new Date(selected.endDate).toLocaleDateString() : "today"}.
        </p>
      ) : null}
    </div>
  );
}
