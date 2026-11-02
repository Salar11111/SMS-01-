import { auth } from "@/lib/auth";
import { loadClassReport, reportCsv } from "@/lib/school";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }
  const year = new URL(request.url).searchParams.get("year") ?? undefined;
  const { rows, selected } = await loadClassReport(year);
  const filename = `${(selected?.name ?? "report").replaceAll(/[^\w.-]+/g, "-")}.csv`;
  return new Response(reportCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
