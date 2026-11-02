import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditPage() {
  const events = await db.audit_findMany({
    populate: { actor: { select: "name email" } },
    orderBy: { createdAt: "desc" },
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit"
        description="The latest changes to people, classes, enrollment, attendance, and grades."
      />
      <Panel>
        {events.length === 0 ? (
          <EmptyState message="No changes recorded yet." />
        ) : (
          <DataTable
            headers={["When", "Who", "Action", "Record", "Before", "After"]}
            rows={events.map((event) => [
              event.createdAt ? formatDate(event.createdAt) : "—",
              event.actor?.name ?? "Unknown",
              event.action,
              event.entity,
              event.before || "—",
              event.after || "—",
            ])}
          />
        )}
      </Panel>
    </div>
  );
}
