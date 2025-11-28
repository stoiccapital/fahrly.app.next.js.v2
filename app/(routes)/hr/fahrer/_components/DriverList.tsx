import Link from "next/link";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import { getMockDriverList } from "@/lib/mocks/hrDriverMocks";
import type { DriverDocumentStatus, DriverListItem, DriverStatus } from "../_types";

type DriverListProps = {
  searchQuery?: string;
  statusFilter?: DriverStatus | "all";
  docsFilter?: DriverDocumentStatus | "all";
};

function filterDrivers(
  drivers: DriverListItem[],
  { searchQuery, statusFilter, docsFilter }: DriverListProps,
): DriverListItem[] {
  let result = drivers;

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter((d) =>
      d.fullName.toLowerCase().includes(q),
    );
  }

  if (statusFilter && statusFilter !== "all") {
    result = result.filter((d) => d.status === statusFilter);
  }

  if (docsFilter && docsFilter !== "all") {
    result = result.filter((d) => d.docsStatus === docsFilter);
  }

  return result;
}

function getStatusLabel(status: DriverStatus): string {
  switch (status) {
    case "active":
      return "Aktiv";
    case "onboarding":
      return "Onboarding";
    case "incomplete":
      return "Unvollständig";
    case "blocked":
      return "Blockiert";
    case "inactive":
      return "Archiviert";
  }
}

function getStatusClasses(status: DriverStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "onboarding":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "incomplete":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "blocked":
      return "bg-red-50 text-red-700 border-red-200";
    case "inactive":
      return "bg-slate-100 text-slate-600 border-slate-300";
  }
}

function getDocsIcon(status: DriverDocumentStatus): string {
  switch (status) {
    case "ok":
      return "🟢";
    case "attention":
      return "🟡";
    case "missing":
      return "🔴";
  }
}

function getDocsLabel(status: DriverDocumentStatus): string {
  switch (status) {
    case "ok":
      return "Alles ok";
    case "attention":
      return "Bald ablaufend";
    case "missing":
      return "Fehlende Dokumente";
  }
}

export function DriverList({
  searchQuery,
  statusFilter = "all",
  docsFilter = "all",
}: DriverListProps) {
  const allDrivers = getMockDriverList();
  const filtered = filterDrivers(allDrivers, {
    searchQuery,
    statusFilter,
    docsFilter,
  });

  if (allDrivers.length === 0) {
    return (
      <>
        <PageHeader
          title="Fahrer"
          description="Übersicht über alle aktiven und ehemaligen Fahrer."
          primaryAction={<Button>Fahrer hinzufügen</Button>}
        />
        <PageState
          status="empty"
          emptyTitle="Noch keine Fahrer angelegt"
          emptyDescription="Legen Sie Ihren ersten Fahrer an, um mit der Planung zu starten."
          emptyAction={<Button>Fahrer hinzufügen</Button>}
        />
      </>
    );
  }

  if (filtered.length === 0) {
    return (
      <>
        <PageHeader
          title="Fahrer"
          description="Übersicht über alle aktiven und ehemaligen Fahrer."
          primaryAction={<Button>Fahrer hinzufügen</Button>}
        />
        <PageState
          status="empty"
          emptyTitle="Keine Fahrer mit diesen Filtern gefunden"
          emptyDescription="Passen Sie die Filter an oder setzen Sie sie zurück."
          emptyAction={
            <Link href="/hr/fahrer">
              <Button variant="secondary">Filter zurücksetzen</Button>
            </Link>
          }
        />
      </>
    );
  }

  const statusValue = statusFilter === "all" ? "" : statusFilter;
  const docsValue = docsFilter === "all" ? "" : docsFilter;
  const statusFromState = statusFilter;
  const docsFromState = docsFilter;

  return (
    <>
      <PageHeader
        title="Fahrer"
        description="Übersicht über alle aktiven und ehemaligen Fahrer."
        primaryAction={<Button>Fahrer hinzufügen</Button>}
      />

      <PageState status="ready">
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <form className="grid gap-3 md:grid-cols-4 md:items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Suche
                </label>
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery ?? ""}
                  placeholder="Name, Telefon, Kennzeichen, E-Mail"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={statusValue}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Alle</option>
                  <option value="active">Aktiv</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="incomplete">Unvollständig</option>
                  <option value="blocked">Blockiert</option>
                  <option value="inactive">Inaktiv / Archiviert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Dokumentenstatus
                </label>
                <select
                  name="docs"
                  defaultValue={docsValue}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Alle</option>
                  <option value="ok">Alles ok</option>
                  <option value="attention">Bald ablaufend</option>
                  <option value="missing">Fehlende Dokumente</option>
                </select>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>
                {filtered.length} von {allDrivers.length} Fahrern angezeigt
              </span>
              {statusFromState !== "all" && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                  Status: {getStatusLabel(statusFromState as DriverStatus)}
                </span>
              )}
              {docsFromState !== "all" && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                  Dokumente: {getDocsLabel(docsFromState as DriverDocumentStatus)}
                </span>
              )}
            </div>
          </Card>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-1">Fahrer</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Dokumente</th>
                    <th className="px-2 py-1">Fahrzeug</th>
                    <th className="px-2 py-1">Letzter Einsatz</th>
                    <th className="px-2 py-1">Stunden (7 Tage)</th>
                    <th className="px-2 py-1">Themen</th>
                    <th className="px-2 py-1 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((driver) => {
                    const detailHref = `/hr/fahrer/${driver.id}`;

                    return (
                      <tr key={driver.id} className="rounded-xl bg-slate-50">
                        <td className="px-2 py-2 align-middle text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                              {driver.initials}
                            </div>
                            <div className="flex flex-col">
                              <Link
                                href={detailHref}
                                className="text-xs font-medium text-slate-900 hover:underline"
                              >
                                {driver.fullName}
                              </Link>
                              {driver.employmentType && (
                                <span className="text-[11px] text-slate-500">
                                  {driver.employmentType === "vollzeit"
                                    ? "Vollzeit"
                                    : driver.employmentType === "teilzeit"
                                    ? "Teilzeit"
                                    : driver.employmentType === "minijob"
                                    ? "Minijob"
                                    : driver.employmentType === "werkstudent"
                                    ? "Werkstudent"
                                    : "Sonstiges"}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 align-middle text-xs">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusClasses(
                              driver.status,
                            )}`}
                          >
                            {getStatusLabel(driver.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle text-xs">
                          <span className="flex items-center gap-1">
                            <span>{getDocsIcon(driver.docsStatus)}</span>
                            <span className="text-[11px] text-slate-600">
                              {getDocsLabel(driver.docsStatus)}
                            </span>
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle text-xs text-slate-600">
                          {driver.vehicleLabel ?? "— kein Fahrzeug"}
                        </td>
                        <td className="px-2 py-2 align-middle text-xs text-slate-600">
                          {driver.lastShiftLabel}
                        </td>
                        <td className="px-2 py-2 align-middle text-xs text-slate-600">
                          {driver.hoursLast7Days} h
                        </td>
                        <td className="px-2 py-2 align-middle text-xs text-slate-600">
                          {driver.issuesLabel || "—"}
                        </td>
                        <td className="px-2 py-2 align-middle text-right text-xs">
                          <Link
                            href={detailHref}
                            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </PageState>
    </>
  );
}

