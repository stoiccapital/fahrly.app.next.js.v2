import Link from "next/link";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import { mockHrDashboardData } from "@/lib/mocks/hrDashboardMocks";
import type {
  HRKpi,
  HRDashboardData,
  HRActionItem,
  HRDriverPreview,
  HREventItem,
} from "../_types";

const data: HRDashboardData = mockHrDashboardData;

function getKpiToneClasses(tone: HRKpi["tone"]): string {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50";
    case "warning":
      return "border-amber-200 bg-amber-50";
    case "danger":
      return "border-red-200 bg-red-50";
    default:
      return "border-slate-200 bg-white";
  }
}

function getDriverStatusLabel(status: HRDriverPreview["status"]): string {
  switch (status) {
    case "active":
      return "Active";
    case "onboarding":
      return "Onboarding";
    case "incomplete":
      return "Incomplete";
    case "blocked":
      return "Blocked";
    case "inactive":
      return "Inactive";
  }
}

function getDocsStatusIcon(status: HRDriverPreview["docsStatus"]): string {
  switch (status) {
    case "ok":
      return "🟢";
    case "attention":
      return "🟡";
    case "missing":
      return "🔴";
    default:
      return "⚪";
  }
}

function getActionSeverityClasses(severity: HRActionItem["severity"]): string {
  switch (severity) {
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
    case "medium":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "low":
      return "text-slate-700 bg-slate-50 border-slate-200";
    default:
      return "text-slate-700 bg-slate-50 border-slate-200";
  }
}

export function HRDashboard() {
  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="HR"
        description="People control center — drivers, documents, contracts, and payroll in one cockpit."
        primaryAction={<Button>Add driver</Button>}
        secondaryActions={
          <Button variant="secondary" size="sm">
            View all drivers
          </Button>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* KPI Row */}
          <section aria-label="HR KPIs">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              {data.kpis.map((kpi) => (
                <Link key={kpi.id} href={kpi.href}>
                  <Card
                    className={`group cursor-pointer border transition-shadow hover:shadow-md ${getKpiToneClasses(
                      kpi.tone,
                    )}`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-slate-500">
                        {kpi.label}
                      </span>
                      <span className="text-lg font-semibold text-slate-900">
                        {kpi.value}
                      </span>
                      <span className="text-[11px] text-slate-400 group-hover:text-slate-500">
                        Click to filter
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Today Status Strip */}
          <section aria-label="Today status">
            <Card className="flex flex-wrap items-center gap-3 bg-slate-900 text-slate-50">
              <div className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium">
                Today
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>{data.statusSummary.absentToday} absent</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span>{data.statusSummary.contractsExpiringToday} contract expires</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span>{data.statusSummary.missingDocsToday} missing docs</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Payroll in {data.statusSummary.daysUntilPayroll} days</span>
                </span>
              </div>
            </Card>
          </section>

          {/* Driver Preview + Action Required */}
          <section className="grid gap-4 lg:grid-cols-3" aria-label="Drivers and actions">
            {/* Driver preview panel */}
            <Card className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-medium text-slate-900">
                    Driver preview
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Top drivers with issues or upcoming risks.
                  </p>
                </div>
                <Link href="/hr/fahrer">
                  <Button variant="secondary" size="sm">
                    View all drivers
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-1">Name</th>
                      <th className="px-2 py-1">Status</th>
                      <th className="px-2 py-1">Docs</th>
                      <th className="px-2 py-1">Contract</th>
                      <th className="px-2 py-1">Payroll</th>
                      <th className="px-2 py-1 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.driverPreviews.map((driver) => (
                      <tr key={driver.id} className="rounded-xl bg-slate-50">
                        <td className="px-2 py-2 align-middle text-xs text-slate-900">
                          <Link
                            href={driver.href}
                            className="font-medium text-slate-900 hover:underline"
                          >
                            {driver.name}
                          </Link>
                        </td>
                        <td className="px-2 py-2 align-middle text-xs">
                          <span
                            className={`
                              inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium
                              ${
                                driver.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : driver.status === "incomplete"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }
                            `}
                          >
                            {getDriverStatusLabel(driver.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle text-xs">
                          <span className="flex items-center gap-1">
                            <span>{getDocsStatusIcon(driver.docsStatus)}</span>
                            <span className="text-[11px] text-slate-600">
                              {driver.docsStatus === "ok"
                                ? "Complete"
                                : driver.docsStatus === "attention"
                                ? "Check soon"
                                : "Missing"}
                            </span>
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle text-xs text-slate-600">
                          {driver.contractStatus}
                        </td>
                        <td className="px-2 py-2 align-middle text-xs text-slate-600">
                          {driver.payrollStatus}
                        </td>
                        <td className="px-2 py-2 align-middle text-right text-xs">
                          <Link
                            href={driver.href}
                            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Action required panel */}
            <Card>
              <div className="mb-3">
                <h2 className="text-sm font-medium text-slate-900">
                  Action required
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Items blocking payroll, compliance, or contracts.
                </p>
              </div>
              <ul className="space-y-2">
                {data.actionItems.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href}>
                      <div
                        className={`flex cursor-pointer items-start justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${getActionSeverityClasses(
                          item.severity,
                        )}`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[11px] opacity-70">
                          View
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Recent events */}
          <section aria-label="Recent HR events">
            <Card>
              <div className="mb-3">
                <h2 className="text-sm font-medium text-slate-900">
                  Recent activity
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Latest changes across drivers, contracts, and payroll.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                {data.events.map((event: HREventItem) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs"
                  >
                    <span>{event.label}</span>
                    <span className="text-[11px] text-slate-500">
                      {event.timestampLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>
      </PageState>
    </>
  );
}

