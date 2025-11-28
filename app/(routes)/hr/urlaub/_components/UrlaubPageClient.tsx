"use client";

import { useMemo, useState } from "react";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from "@/app/(routes)/hr/_types";

type UrlaubPageClientProps = {
  requestsFromServer: LeaveRequest[];
};

type ViewMode = "list" | "calendar";

type FiltersState = {
  search: string;
  status: LeaveStatus | "all";
  type: LeaveType | "all";
  period: "all" | "this_month";
};

type NewLeaveDraft = {
  driverId?: string;
  type?: LeaveType;
  startDate?: string;
  endDate?: string;
  fullDay: boolean;
  driverComment?: string;
};

function leaveTypeLabel(type: LeaveType): string {
  switch (type) {
    case "vacation":
      return "Urlaub";
    case "sick":
      return "Krankheit";
    case "special":
      return "Sonderurlaub";
    case "unpaid":
      return "Unbezahlt";
  }
}

function leaveStatusLabel(status: LeaveStatus): string {
  switch (status) {
    case "pending":
      return "Offen";
    case "approved":
      return "Genehmigt";
    case "rejected":
      return "Abgelehnt";
    case "cancelled":
      return "Storniert";
  }
}

function leaveStatusClasses(status: LeaveStatus): string {
  switch (status) {
    case "pending":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    case "cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function daysBetweenInclusive(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function dateRangeLabel(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const f = (d: Date) =>
    d.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  if (start === end) return f(s);
  return `${f(s)} – ${f(e)}`;
}

function conflictLabel(req: LeaveRequest): string {
  const c = req.conflictSummary;
  if (!c) return "Keine Daten";
  if (!c.affectedShiftCount) return "Keine Konflikte";
  const base = `${c.affectedShiftCount} Schichten betroffen`;
  if (c.hasUncoveredShifts) {
    return `${base} · Vertretung fehlt`;
  }
  return `${base} · Vertretung geplant`;
}

function conflictIcon(req: LeaveRequest): string {
  const c = req.conflictSummary;
  if (!c || !c.affectedShiftCount) return "✅";
  if (c.hasUncoveredShifts) return "⚠️";
  return "ℹ️";
}

function kpiCardClasses(active: boolean): string {
  return active
    ? "cursor-pointer border-indigo-200 bg-indigo-50 shadow-sm"
    : "cursor-pointer hover:shadow-md";
}

type CalendarDayEvent = {
  id: string;
  driverInitials: string;
  type: LeaveType;
  status: LeaveStatus;
};

type CalendarDay = {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  events: CalendarDayEvent[];
};

function buildCalendarDays(requests: LeaveRequest[]): {
  monthLabel: string;
  days: CalendarDay[];
} {
  if (requests.length === 0) {
    const now = new Date();
    const monthLabel = now.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
    });
    return { monthLabel, days: [] };
  }

  const first = new Date(
    requests[0].startDate ?? requests[0].createdAt.slice(0, 10),
  );
  const year = first.getFullYear();
  const month = first.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const firstDayOfWeek = monthStart.getDay(); // 0=Sun
  const offset = (firstDayOfWeek + 6) % 7; // Monday-based

  const days: CalendarDay[] = [];

  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - offset);

  const totalCells = 42; // 6 weeks * 7 days
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: iso,
      dayOfMonth: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      events: [],
    });
  }

  // Map date -> day index
  const indexByDate = new Map<string, number>();
  days.forEach((day, idx) => {
    indexByDate.set(day.date, idx);
  });

  // Distribute events
  for (const req of requests) {
    const s = new Date(req.startDate);
    const e = new Date(req.endDate);
    const d = new Date(s);
    while (d.getTime() <= e.getTime()) {
      const iso = d.toISOString().slice(0, 10);
      const index = indexByDate.get(iso);
      if (index !== undefined) {
        days[index].events.push({
          id: req.id,
          driverInitials: req.driverInitials,
          type: req.type,
          status: req.status,
        });
      }
      d.setDate(d.getDate() + 1);
    }
  }

  const monthLabel = monthStart.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  return { monthLabel, days };
}

function leaveTypeBadgeClasses(type: LeaveType): string {
  switch (type) {
    case "vacation":
      return "bg-emerald-50 text-emerald-700";
    case "sick":
      return "bg-amber-50 text-amber-700";
    case "special":
      return "bg-sky-50 text-sky-700";
    case "unpaid":
      return "bg-slate-100 text-slate-700";
  }
}

export function UrlaubPageClient({ requestsFromServer }: UrlaubPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    status: "all",
    type: "all",
    period: "this_month",
  });

  const [requests, setRequests] = useState<LeaveRequest[]>(requestsFromServer);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [draft, setDraft] = useState<NewLeaveDraft>({
    fullDay: true,
  });

  const filteredRequests = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return requests.filter((req) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !req.driverName.toLowerCase().includes(q) &&
          !req.driverInitials.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (filters.status !== "all" && req.status !== filters.status) {
        return false;
      }

      if (filters.type !== "all" && req.type !== filters.type) {
        return false;
      }

      if (filters.period === "this_month") {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const overlapsMonth =
          (start.getFullYear() === thisYear &&
            start.getMonth() === thisMonth) ||
          (end.getFullYear() === thisYear && end.getMonth() === thisMonth);
        if (!overlapsMonth) return false;
      }

      return true;
    });
  }, [requests, filters]);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  );

  const { monthLabel, days: calendarDays } = useMemo(
    () => buildCalendarDays(filteredRequests),
    [filteredRequests],
  );

  function setStatus(id: string, status: LeaveStatus) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  }

  function openCreateModal() {
    setDraft({
      fullDay: true,
    });
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
  }

  function handleCreateSubmit(formData: FormData) {
    const driverId = (formData.get("driverId") as string) || "";
    const driverName = (formData.get("driverName") as string) || "";
    const driverInitials =
      (formData.get("driverInitials") as string) || "??";
    const type = formData.get("type") as LeaveType | null;
    const startDate = (formData.get("startDate") as string) || "";
    const endDate = (formData.get("endDate") as string) || startDate;
    const fullDay = (formData.get("fullDay") as string) === "true";
    const driverComment = (formData.get("driverComment") as string) || "";

    if (!driverId || !driverName || !type || !startDate) {
      closeCreateModal();
      return;
    }

    const newRequest: LeaveRequest = {
      id: `leave-new-${Date.now()}`,
      driverId,
      driverName,
      driverInitials,
      driverStatus: "active",
      depotLabel: "Berlin",
      type,
      status: "pending",
      startDate,
      endDate,
      fullDay,
      driverComment,
      managerComment: undefined,
      approverName: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conflictSummary: {
        affectedShiftCount: daysBetweenInclusive(startDate, endDate) >= 3 ? 3 : 0,
        hasUncoveredShifts: daysBetweenInclusive(startDate, endDate) >= 3,
        locationLabel: "Berlin",
        otherAbsentCountSameLocation: 0,
      },
    };

    setRequests((prev) => [newRequest, ...prev]);
    setSelectedRequestId(newRequest.id);
    closeCreateModal();
  }

  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="Urlaub & Abwesenheit"
        description="Anträge, Genehmigungen und Überschneidungen im Blick behalten."
        primaryAction={
          <Button type="button" onClick={openCreateModal}>
            + Urlaubsantrag anlegen
          </Button>
        }
        secondaryActions={
          <div className="flex items-center gap-2 text-xs">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-full px-3 py-1 ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Liste
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`rounded-full px-3 py-1 ${
                  viewMode === "calendar"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Kalender
              </button>
            </div>
          </div>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <div className="grid gap-3 md:grid-cols-5 md:items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Fahrer
                </label>
                <input
                  type="text"
                  placeholder="Name suchen…"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: (e.target.value as LeaveStatus | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="pending">Offen</option>
                  <option value="approved">Genehmigt</option>
                  <option value="rejected">Abgelehnt</option>
                  <option value="cancelled">Storniert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Typ
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: (e.target.value as LeaveType | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="vacation">Urlaub</option>
                  <option value="sick">Krankheit</option>
                  <option value="special">Sonderurlaub</option>
                  <option value="unpaid">Unbezahlt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Zeitraum
                </label>
                <select
                  value={filters.period}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      period: e.target.value as FiltersState["period"],
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="this_month">Dieser Monat</option>
                  <option value="all">Alle Zeiträume</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Content */}
          {viewMode === "list" ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-1">Fahrer</th>
                      <th className="px-2 py-1">Typ</th>
                      <th className="px-2 py-1">Zeitraum</th>
                      <th className="px-2 py-1">Status</th>
                      <th className="px-2 py-1">Konflikte</th>
                      <th className="px-2 py-1">Erstellt am</th>
                      <th className="px-2 py-1">Verantwortlich</th>
                      <th className="px-2 py-1 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-2 py-6 text-center text-xs text-slate-500"
                        >
                          Keine Urlaubs- oder Abwesenheitsanträge für diese
                          Filter.
                        </td>
                      </tr>
                    )}

                    {filteredRequests.map((req) => {
                      const days = daysBetweenInclusive(
                        req.startDate,
                        req.endDate,
                      );
                      const conflict = req.conflictSummary;

                      return (
                        <tr
                          key={req.id}
                          className="cursor-pointer rounded-xl bg-slate-50 hover:bg-slate-100"
                          onClick={() => setSelectedRequestId(req.id)}
                        >
                          <td className="px-2 py-2 align-top">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                                {req.driverInitials}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-900">
                                  {req.driverName}
                                </span>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                                  {req.depotLabel && (
                                    <span>{req.depotLabel}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${leaveTypeBadgeClasses(
                                req.type,
                              )}`}
                            >
                              {leaveTypeLabel(req.type)}
                            </span>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="text-xs text-slate-900">
                              {dateRangeLabel(req.startDate, req.endDate)}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {days} Tag
                              {days === 1 ? "" : "e"} ·{" "}
                              {req.fullDay ? "Ganzer Tag" : "Teilweise"}
                            </div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${leaveStatusClasses(
                                req.status,
                              )}`}
                            >
                              {leaveStatusLabel(req.status)}
                            </span>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="flex flex-col text-[11px] text-slate-600">
                              <span>
                                {conflictIcon(req)} {conflictLabel(req)}
                              </span>
                              {conflict?.locationLabel && (
                                <span className="text-slate-500">
                                  Standort: {conflict.locationLabel}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="text-xs text-slate-900">
                              {new Date(
                                req.createdAt,
                              ).toLocaleDateString("de-DE", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {new Date(
                                req.createdAt,
                              ).toLocaleTimeString("de-DE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="text-xs text-slate-900">
                              {req.approverName ?? "Noch offen"}
                            </div>
                          </td>
                          <td
                            className="px-2 py-2 align-top text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-wrap justify-end gap-1 text-[11px]">
                              {req.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 hover:border-emerald-300"
                                    onClick={() => setStatus(req.id, "approved")}
                                  >
                                    Genehmigen
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-red-700 hover:border-red-300"
                                    onClick={() => setStatus(req.id, "rejected")}
                                  >
                                    Ablehnen
                                  </button>
                                </>
                              )}
                              {req.status !== "pending" && (
                                <button
                                  type="button"
                                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600 hover:border-slate-300"
                                  onClick={() => setSelectedRequestId(req.id)}
                                >
                                  Details
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="mb-3 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[11px] font-medium text-slate-500">
                    Kalenderansicht
                  </div>
                  <div className="text-xs text-slate-700">
                    Überblick, wer wann abwesend ist. Farben: Urlaub (grün),
                    Krankheit (orange), Sonderurlaub (blau), Unbezahlt (grau).
                  </div>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                  {monthLabel}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[11px] text-slate-500">
                <div className="text-center">Mo</div>
                <div className="text-center">Di</div>
                <div className="text-center">Mi</div>
                <div className="text-center">Do</div>
                <div className="text-center">Fr</div>
                <div className="text-center">Sa</div>
                <div className="text-center">So</div>
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1 text-xs">
                {calendarDays.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    className={`flex min-h-[72px] flex-col rounded-xl border px-1.5 py-1.5 text-left ${
                      day.isCurrentMonth
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-100 bg-white text-slate-400"
                    }`}
                    onClick={() => {
                      const firstEvent = day.events[0];
                      if (!firstEvent) return;

                      const req = filteredRequests.find(
                        (r) => r.id === firstEvent.id,
                      );
                      if (req) setSelectedRequestId(req.id);
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span>{day.dayOfMonth}</span>
                      {day.events.length > 0 && (
                        <span className="rounded-full bg-slate-900/5 px-1 text-[10px] text-slate-600">
                          {day.events.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 space-y-0.5">
                      {day.events.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id + ev.driverInitials}
                          className={`flex items-center gap-1 rounded-full px-1 py-0.5 text-[10px] ${
                            leaveTypeBadgeClasses(ev.type)
                          }`}
                        >
                          <span className="font-medium">
                            {ev.driverInitials}
                          </span>
                          <span>
                            {ev.type === "vacation"
                              ? "U"
                              : ev.type === "sick"
                              ? "K"
                              : ev.type === "special"
                              ? "S"
                              : "UN"}
                          </span>
                        </div>
                      ))}
                      {day.events.length > 3 && (
                        <div className="text-[10px] text-slate-500">
                          +{day.events.length - 3} weitere
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Detail panel as card below */}
          {selectedRequest && (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-slate-900">
                    Urlaubsantrag von {selectedRequest.driverName}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    {dateRangeLabel(
                      selectedRequest.startDate,
                      selectedRequest.endDate,
                    )}{" "}
                    · {daysBetweenInclusive(
                      selectedRequest.startDate,
                      selectedRequest.endDate,
                    )}{" "}
                    Tag
                    {daysBetweenInclusive(
                      selectedRequest.startDate,
                      selectedRequest.endDate,
                    ) === 1
                      ? ""
                      : "e"}{" "}
                    · {leaveTypeLabel(selectedRequest.type)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${leaveStatusClasses(
                      selectedRequest.status,
                    )}`}
                  >
                    {leaveStatusLabel(selectedRequest.status)}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1 text-[11px]">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedRequestId(null)}
                    >
                      Schließen
                    </Button>
                    {selectedRequest.status === "pending" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            setStatus(selectedRequest.id, "approved")
                          }
                        >
                          Genehmigen
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setStatus(selectedRequest.id, "rejected")
                          }
                        >
                          Ablehnen
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2 text-xs text-slate-700">
                {/* Left: request details */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Antragsdetails
                    </div>
                    <div className="mt-1 space-y-1">
                      <div>
                        Fahrer:{" "}
                        <a
                          href={`/hr/fahrer/${selectedRequest.driverId}`}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {selectedRequest.driverName}
                        </a>
                      </div>
                      <div>Typ: {leaveTypeLabel(selectedRequest.type)}</div>
                      <div>
                        Zeitraum:{" "}
                        {dateRangeLabel(
                          selectedRequest.startDate,
                          selectedRequest.endDate,
                        )}
                      </div>
                      <div>
                        Umfang:{" "}
                        {selectedRequest.fullDay
                          ? "Ganzer Tag"
                          : "Teilweise / Stunden"}
                      </div>
                      <div>
                        Eingereicht am:{" "}
                        {new Date(
                          selectedRequest.createdAt,
                        ).toLocaleString("de-DE")}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-[11px] font-medium text-slate-500">
                      Kommentar Fahrer
                    </div>
                    <div className="mt-1 text-[11px] text-slate-700">
                      {selectedRequest.driverComment ??
                        "Kein Kommentar hinterlegt."}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-[11px] font-medium text-slate-500">
                      Entscheidung &amp; Kommentar
                    </div>
                    <div className="mt-1 space-y-1">
                      <div>
                        Verantwortlich:{" "}
                        {selectedRequest.approverName ?? "Noch nicht gesetzt"}
                      </div>
                      <div className="text-[11px] text-slate-700">
                        {selectedRequest.managerComment ??
                          "Noch kein Kommentar zur Entscheidung hinterlegt (Mock)."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: impact & conflicts */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Auswirkung auf Schichten (Mock)
                    </div>
                    <div className="mt-1 space-y-1 text-[11px] text-slate-700">
                      {selectedRequest.conflictSummary ? (
                        <>
                          <div>
                            Betroffene Schichten:{" "}
                            {
                              selectedRequest.conflictSummary
                                .affectedShiftCount
                            }
                          </div>
                          <div>
                            Vertretung:{" "}
                            {selectedRequest.conflictSummary.hasUncoveredShifts
                              ? "Noch offene Lücken"
                              : "Bereits ersetzt (Mock)"}
                          </div>
                          {selectedRequest.conflictSummary.locationLabel && (
                            <div>
                              Standort:{" "}
                              {selectedRequest.conflictSummary.locationLabel}
                            </div>
                          )}
                          <div>
                            Weitere Abwesenheiten im Zeitraum (Standort):{" "}
                            {
                              selectedRequest.conflictSummary
                                .otherAbsentCountSameLocation
                            }
                          </div>
                        </>
                      ) : (
                        <div>Keine Konfliktdaten vorhanden (Mock).</div>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-indigo-600">
                      Später: Direkt in Schichten öffnen &amp; Vertretungen
                      planen.
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-[11px] font-medium text-slate-500">
                      Auswirkung auf Zeiterfassung &amp; Gehalt (Mock)
                    </div>
                    <div className="mt-1 text-[11px] text-slate-700">
                      {selectedRequest.type === "vacation" && (
                        <>
                          Diese Tage werden als bezahlter Urlaub in der
                          Abrechnung berücksichtigt (v2 mit echter Logik).
                        </>
                      )}
                      {selectedRequest.type === "unpaid" && (
                        <>
                          Diese Tage sind unbezahlte Abwesenheiten – weniger
                          Stunden im Gehaltsrechner.
                        </>
                      )}
                      {selectedRequest.type === "sick" && (
                        <>
                          Krankheitstage können je nach Modell anders vergütet
                          werden. Logik folgt im Backend.
                        </>
                      )}
                      {selectedRequest.type === "special" && (
                        <>
                          Sonderurlaub wird je nach Betrieb individuell
                          behandelt. Später konfigurierbar.
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-[11px] font-medium text-slate-500">
                      Überschneidungen (Mock)
                    </div>
                    <div className="mt-1 text-[11px] text-slate-700">
                      In v2 können hier konkrete andere Abwesenheiten im gleichen
                      Zeitraum und Standort angezeigt werden, um Entscheidungen
                      abzusichern.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Create modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40">
              <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-900">
                    Urlaubsantrag anlegen
                  </h2>
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Schließen
                  </button>
                </div>
                <form
                  className="mt-3 space-y-3 text-xs"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleCreateSubmit(formData);
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Fahrer
                      </label>
                      {/* v1: simple free-text id+name pair, später: echter Select */}
                      <input
                        type="text"
                        name="driverName"
                        placeholder="Max Schneider"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                      <input type="hidden" name="driverId" value="driver-manual" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Initialen
                      </label>
                      <input
                        type="text"
                        name="driverInitials"
                        placeholder="MS"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Typ
                    </label>
                    <select
                      name="type"
                      defaultValue="vacation"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    >
                      <option value="vacation">Urlaub</option>
                      <option value="sick">Krankheit</option>
                      <option value="special">Sonderurlaub</option>
                      <option value="unpaid">Unbezahlt</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Startdatum
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Enddatum
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Umfang
                    </label>
                    <select
                      name="fullDay"
                      defaultValue="true"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="true">Ganzer Tag</option>
                      <option value="false">Teilweise / Stunden</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Kommentar Fahrer (optional)
                    </label>
                    <textarea
                      name="driverComment"
                      rows={3}
                      placeholder="Kurzbeschreibung, z.B. Familienurlaub"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                    Mock-Konfliktcheck: Bei längeren Zeiträumen werden
                    betroffene Schichten als Hinweis in der Liste und im Detail
                    angezeigt. In v2 erfolgt hier eine echte Prüfung gegen
                    Schichten und Zeiterfassung.
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full">
                      Antrag speichern
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </PageState>
    </>
  );
}

