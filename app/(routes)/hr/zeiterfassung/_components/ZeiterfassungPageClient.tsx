"use client";

import { useMemo, useState } from "react";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  TimeEntry,
  TimeEntryDriverSummary,
  TimeEntryKpis,
  TimeEntryStatus,
  TimeEntrySource,
} from "@/app/(routes)/hr/_types";
import Link from "next/link";

type ZeiterfassungPageClientProps = {
  weekStartDate: string;
  drivers: TimeEntryDriverSummary[];
  entries: TimeEntry[];
  kpis: TimeEntryKpis;
};

type FiltersState = {
  driverId: string;
  status: TimeEntryStatus | "all";
  source: TimeEntrySource | "all";
};

type PeriodMode = "week"; // keep v1 simple, extend later

type CreateTimeEntryDraft = {
  driverId?: string;
  date?: string;
};

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getWeekDates(startDate: string, weekOffset: number): string[] {
  const base = new Date(startDate);
  const monday = addDays(base, weekOffset * 7);
  return Array.from({ length: 7 }).map((_, idx) =>
    formatDateISO(addDays(monday, idx)),
  );
}

function getWeekLabel(startDate: string, weekOffset: number): string {
  const dates = getWeekDates(startDate, weekOffset);
  if (dates.length === 0) return "";
  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);

  const startLabel = first.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });
  const endLabel = last.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });
  const year = first.getFullYear();

  return `${startLabel} – ${endLabel} ${year}`;
}

function calculateDurationHours(entry: TimeEntry): number {
  const [startH, startM] = entry.start.split(":").map(Number);
  const [endH, endM] = entry.end.split(":").map(Number);
  let hours = endH + endM / 60 - (startH + startM / 60);
  if (hours <= 0) hours += 24;
  const breakHours = (entry.breakMinutes ?? 0) / 60;
  return Math.max(hours - breakHours, 0);
}

function formatHours(hours: number): string {
  return hours.toFixed(1).replace(".", ",");
}

function statusLabel(status: TimeEntryStatus): string {
  switch (status) {
    case "recorded":
      return "Erfasst";
    case "pending_review":
      return "Zur Prüfung";
    case "approved":
      return "Freigegeben";
    case "rejected":
      return "Abgelehnt";
  }
}

function statusClasses(status: TimeEntryStatus): string {
  switch (status) {
    case "recorded":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "pending_review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function sourceLabel(source: TimeEntrySource): string {
  switch (source) {
    case "manual":
      return "Manuell";
    case "app":
      return "App";
    case "telematics":
      return "Telematik";
  }
}

export function ZeiterfassungPageClient({
  weekStartDate,
  drivers,
  entries: entriesFromServer,
  kpis,
}: ZeiterfassungPageClientProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({
    driverId: "",
    status: "all",
    source: "all",
  });

  const [entries, setEntries] = useState<TimeEntry[]>(entriesFromServer);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<CreateTimeEntryDraft>({});
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const weekLabel = useMemo(
    () => getWeekLabel(weekStartDate, weekOffset),
    [weekStartDate, weekOffset],
  );
  const weekDates = useMemo(
    () => getWeekDates(weekStartDate, weekOffset),
    [weekStartDate, weekOffset],
  );

  const driverMap = useMemo(() => {
    const map = new Map<string, TimeEntryDriverSummary>();
    for (const d of drivers) map.set(d.id, d);
    return map;
  }, [drivers]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (!weekDates.includes(entry.date)) return false;

      if (filters.driverId && entry.driverId !== filters.driverId) {
        return false;
      }

      if (filters.status !== "all" && entry.status !== filters.status) {
        return false;
      }

      if (filters.source !== "all" && entry.source !== filters.source) {
        return false;
      }

      return true;
    });
  }, [entries, weekDates, filters.driverId, filters.status, filters.source]);

  const derivedKpis: TimeEntryKpis = useMemo(() => {
    let totalHours = 0;
    let notApprovedCount = 0;
    let missingFromShiftCount = 0;
    let overtimeEntryCount = 0;

    for (const entry of filteredEntries) {
      const h = calculateDurationHours(entry);
      totalHours += h;

      if (entry.status !== "approved") {
        notApprovedCount += 1;
      }

      if (!entry.shiftId) {
        missingFromShiftCount += 1;
      }

      if (h > 10) {
        overtimeEntryCount += 1;
      }
    }

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      notApprovedCount,
      missingFromShiftCount,
      overtimeEntryCount,
    };
  }, [filteredEntries]);

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  function openModal(withDraft: CreateTimeEntryDraft) {
    setDraft(withDraft);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setDraft({});
  }

  function handleCreateSubmit(formData: FormData) {
    const driverId = (formData.get("driverId") as string) || "";
    const date = (formData.get("date") as string) || "";
    const start = (formData.get("start") as string) || "06:00";
    const end = (formData.get("end") as string) || "14:00";
    const breakMinutesRaw = formData.get("breakMinutes") as string;
    const breakMinutes =
      breakMinutesRaw && breakMinutesRaw.trim().length > 0
        ? Number(breakMinutesRaw)
        : undefined;
    const source = (formData.get("source") as TimeEntrySource) || "manual";

    if (!driverId || !date) {
      closeModal();
      return;
    }

    const newEntry: TimeEntry = {
      id: `te-new-${Date.now()}`,
      driverId,
      date,
      start,
      end,
      breakMinutes,
      source,
      status: "recorded",
      shiftId: undefined,
      locationLabel: undefined,
      note: undefined,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setSelectedEntryId(newEntry.id);
    closeModal();
  }

  function setStatus(entryId: string, nextStatus: TimeEntryStatus) {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status: nextStatus } : e)),
    );
  }

  function kpiCardClasses(active: boolean): string {
    return active
      ? "cursor-pointer border-indigo-200 bg-indigo-50 shadow-sm"
      : "cursor-pointer hover:shadow-md";
  }

  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="Zeiterfassung"
        description="Erfasste Arbeitszeiten prüfen, korrigieren und für die Abrechnung freigeben."
        primaryAction={
          <Button onClick={() => openModal({})}>+ Zeit erfassen</Button>
        }
        secondaryActions={
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
              Zeitraum: Woche
            </span>
            <Link href="/hr/schichten">
              <Button variant="secondary" size="sm">
                Schichtplan öffnen
              </Button>
            </Link>
          </div>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* Period controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
              <span className="font-medium">Woche</span>
              <span className="text-slate-500">{weekLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-slate-300"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="inline-flex h-8 px-3 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-300"
              >
                Aktuelle Woche
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-slate-300"
              >
                ›
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              className={kpiCardClasses(false)}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "all",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Gesamtstunden (Woche)
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {formatHours(derivedKpis.totalHours)} h
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Summe aller Einträge in dieser Woche.
              </div>
            </Card>
            <Card
              className={kpiCardClasses(filters.status !== "approved")}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "approved",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Nicht freigegebene Einträge
              </div>
              <div className="mt-1 text-xl font-semibold text-amber-600">
                {derivedKpis.notApprovedCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Alles, was noch nicht für Payroll freigegeben ist.
              </div>
            </Card>
            <Card
              className={kpiCardClasses(false)}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "all",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Fehlende Zeiten (laut Schichtplan)
              </div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {derivedKpis.missingFromShiftCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Einträge ohne verknüpfte Schicht (Mock-Regel).
              </div>
            </Card>
            <Card
              className={kpiCardClasses(false)}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "all",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Überstunden (&gt; 10h/Tag)
              </div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {derivedKpis.overtimeEntryCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Einträge mit hoher Tagesbelastung.
              </div>
            </Card>
          </div>

          {/* Filter bar */}
          <Card>
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Fahrer
                </label>
                <select
                  value={filters.driverId}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      driverId: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Alle Fahrer</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Standort / Depot
                </label>
                <select
                  value={""}
                  onChange={() => {
                    // v1: visual only, no filtering yet
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option>Alle Standorte</option>
                  <option>Berlin</option>
                </select>
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
                      status: (e.target.value as TimeEntryStatus | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="recorded">Erfasst</option>
                  <option value="pending_review">Zur Prüfung</option>
                  <option value="approved">Freigegeben</option>
                  <option value="rejected">Abgelehnt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Quelle
                </label>
                <select
                  value={filters.source}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      source: (e.target.value as TimeEntrySource | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle Quellen</option>
                  <option value="manual">Manuell</option>
                  <option value="app">App</option>
                  <option value="telematics">Telematik</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Timesheet table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-1">Fahrer</th>
                    <th className="px-2 py-1">Datum</th>
                    <th className="px-2 py-1">Zeitraum</th>
                    <th className="px-2 py-1">Stunden</th>
                    <th className="px-2 py-1">Schicht</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Quelle</th>
                    <th className="px-2 py-1 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-2 py-6 text-center text-xs text-slate-500"
                      >
                        Keine Zeiteinträge für diesen Zeitraum und diese Filter.
                      </td>
                    </tr>
                  )}

                  {filteredEntries.map((entry) => {
                    const driver = driverMap.get(entry.driverId);
                    const hours = calculateDurationHours(entry);
                    const isOvertime = hours > 10;
                    const hasShift = Boolean(entry.shiftId);

                    return (
                      <tr key={entry.id} className="rounded-xl bg-slate-50">
                        <td className="px-2 py-2 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                              {driver?.initials ?? "??"}
                            </div>
                            <div className="flex flex-col">
                              {driver ? (
                                <Link
                                  href={`/hr/fahrer/${driver.id}`}
                                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                  {driver.name}
                                </Link>
                              ) : (
                                <span className="text-xs font-medium text-slate-900">
                                  Unbekannter Fahrer
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500">
                                {driver?.depotLabel ?? "Depot unbekannt"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-slate-900">
                            {new Date(entry.date).toLocaleDateString("de-DE", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-slate-900">
                            {entry.start} – {entry.end}
                          </div>
                          {entry.breakMinutes && entry.breakMinutes > 0 && (
                            <div className="text-[11px] text-slate-500">
                              Pause: {entry.breakMinutes} min
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                              isOvertime
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isOvertime ? "⚠️" : "⏱️"} {formatHours(hours)} h
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top">
                          {hasShift ? (
                            <div className="flex flex-col text-[11px]">
                              <span className="text-emerald-700">
                                🟢 Verknüpfte Schicht
                              </span>
                              <span className="text-slate-500">
                                Plan: (Mock) 06:00–14:00
                              </span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-red-600">
                              🔴 Keine Schicht zugeordnet
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClasses(
                              entry.status,
                            )}`}
                          >
                            {statusLabel(entry.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <span className="text-[11px] text-slate-700">
                            {sourceLabel(entry.source)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top text-right">
                          <div className="flex flex-wrap justify-end gap-1 text-[11px]">
                            <button
                              type="button"
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600 hover:border-slate-300"
                              onClick={() =>
                                openModal({
                                  driverId: entry.driverId,
                                  date: entry.date,
                                })
                              }
                            >
                              Bearbeiten
                            </button>
                            {entry.status !== "approved" && (
                              <button
                                type="button"
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 hover:border-emerald-300"
                                onClick={() =>
                                  setStatus(entry.id, "approved")
                                }
                              >
                                Freigeben
                              </button>
                            )}
                            {entry.status !== "rejected" && (
                              <button
                                type="button"
                                className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-red-700 hover:border-red-300"
                                onClick={() =>
                                  setStatus(entry.id, "rejected")
                                }
                              >
                                Ablehnen
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

          {/* Optional: simple selected entry detail (v1 = minimal) */}
          {selectedEntry && (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-slate-900">
                    Eintragsdetails
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Schneller Überblick für einen einzelnen Zeiteintrag.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEntryId(null)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Schließen
                </button>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2 text-xs text-slate-700">
                <div className="space-y-2">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Basis
                    </div>
                    <div className="mt-1">
                      <div>
                        Datum:{" "}
                        {new Date(selectedEntry.date).toLocaleDateString(
                          "de-DE",
                          {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                          },
                        )}
                      </div>
                      <div>
                        Zeitraum: {selectedEntry.start} – {selectedEntry.end}
                      </div>
                      <div>
                        Netto: {formatHours(calculateDurationHours(selectedEntry))}{" "}
                        h
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Status &amp; Quelle
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClasses(
                          selectedEntry.status,
                        )}`}
                      >
                        {statusLabel(selectedEntry.status)}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">
                        {sourceLabel(selectedEntry.source)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Schicht &amp; Verknüpfungen
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      {selectedEntry.shiftId ? (
                        <>
                          <div>Verknüpfte Schicht: Ja (Mock)</div>
                          <div>Plan: 06:00–14:00 (Mock)</div>
                        </>
                      ) : (
                        <div>Keine Schicht verknüpft.</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Notizen
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      {selectedEntry.note ?? "Keine Notiz hinterlegt."}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Add/Edit Time Entry Modal (v1 = create only, edit reuses same form) */}
          {isModalOpen && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40">
              <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-900">
                    Zeit erfassen
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
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
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Fahrer
                    </label>
                    <select
                      name="driverId"
                      defaultValue={draft.driverId ?? ""}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    >
                      <option value="">Bitte wählen…</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Datum
                      </label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={draft.date ?? weekDates[0]}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Quelle
                      </label>
                      <select
                        name="source"
                        defaultValue="manual"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="manual">Manuell</option>
                        <option value="app">App</option>
                        <option value="telematics">Telematik</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Startzeit
                      </label>
                      <input
                        type="time"
                        name="start"
                        defaultValue="06:00"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Endzeit
                      </label>
                      <input
                        type="time"
                        name="end"
                        defaultValue="14:00"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Pause (Min.)
                      </label>
                      <input
                        type="number"
                        name="breakMinutes"
                        min={0}
                        step={5}
                        placeholder="z.B. 30"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                    Netto-Stunden werden automatisch berechnet. In einer späteren
                    Version wird hier die Abweichung zur geplanten Schicht
                    angezeigt.
                  </div>
                  <div className="pt-2">
                    <Button type="submit" className="w-full">
                      Speichern
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

