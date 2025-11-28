"use client";

import { useMemo, useState } from "react";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  DriverPerformance,
  DriverPerformanceSegment,
  PerformanceKpis,
  PerformancePeriod,
} from "@/app/(routes)/hr/_types";

type LeistungsuebersichtPageClientProps = {
  initialPeriod: PerformancePeriod;
  allPeriods: PerformancePeriod[];
  performancesFromServer: DriverPerformance[];
  kpisFromServer: PerformanceKpis;
};

type FiltersState = {
  search: string;
  segment: DriverPerformanceSegment | "all";
};

function segmentLabel(segment: DriverPerformanceSegment): string {
  switch (segment) {
    case "top":
      return "Top";
    case "ok":
      return "OK";
    case "risk":
      return "Risiko";
  }
}

function segmentClasses(segment: DriverPerformanceSegment): string {
  switch (segment) {
    case "top":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ok":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "risk":
      return "bg-amber-50 text-amber-800 border-amber-200";
  }
}

function scoreBarColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-sky-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function percentLabel(value: number): string {
  return `${Math.round(value * 100)} %`;
}

export function LeistungsuebersichtPageClient({
  initialPeriod,
  allPeriods,
  performancesFromServer,
  kpisFromServer,
}: LeistungsuebersichtPageClientProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(initialPeriod.id);
  const [performances] = useState<DriverPerformance[]>(performancesFromServer);
  const [kpis] = useState<PerformanceKpis>(kpisFromServer);
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    segment: "all",
  });

  const filteredPerformances = useMemo(() => {
    return performances
      .filter((p) => p.periodId === selectedPeriodId)
      .filter((p) => {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          if (
            !p.driverName.toLowerCase().includes(q) &&
            !p.location?.toLowerCase().includes(q)
          ) {
            return false;
          }
        }

        if (filters.segment !== "all" && p.segment !== filters.segment) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [performances, selectedPeriodId, filters]);

  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="Leistungsübersicht"
        description="Kennzahlen pro Fahrer – Qualität, Einsatz und Wirtschaftlichkeit im gewählten Zeitraum."
        primaryAction={
          <Button type="button" variant="secondary">
            Export (Mock)
          </Button>
        }
        secondaryActions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">
              Zeitraum
            </span>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {allPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* KPI row */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="cursor-default">
              <div className="text-[11px] font-medium text-slate-500">
                Aktive Fahrer im Zeitraum
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {kpis.activeDriversInPeriod}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Fahrer mit Einsatz im gewählten Zeitraum.
              </div>
            </Card>
            <Card className="cursor-default">
              <div className="text-[11px] font-medium text-slate-500">
                Ø Stunden pro Fahrer
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {kpis.averageHoursPerDriver.toFixed(1)} h
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Gesamtstunden / aktive Fahrer.
              </div>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  segment: "top",
                }))
              }
            >
              <div className="text-[11px] font-medium text-slate-500">
                Ø Pünktlichkeitsquote
              </div>
              <div className="mt-1 text-xl font-semibold text-emerald-600">
                {percentLabel(kpis.averageOnTimeRate)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Klick für Fokus auf Top-Fahrer.
              </div>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  segment: "risk",
                }))
              }
            >
              <div className="text-[11px] font-medium text-slate-500">
                Kundenbeschwerden
              </div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {kpis.complaintsCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Auffällige Fahrer zuerst anzeigen.
              </div>
            </Card>
            <Card className="cursor-default">
              <div className="text-[11px] font-medium text-slate-500">
                Unfälle / Vorfälle
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {kpis.incidentsCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Summe aus No-Shows & Compliance-Issues (Mock).
              </div>
            </Card>
            <Card className="cursor-default">
              <div className="text-[11px] font-medium text-slate-500">
                Top 10% – Anteil der Stunden
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {percentLabel(kpis.topDriversShareOfWork)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Wie stark tragen Top-Fahrer die Flotte?
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <div className="grid gap-3 md:grid-cols-3 md:items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Fahrer / Standort
                </label>
                <input
                  type="text"
                  placeholder="Name oder Standort…"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Segment
                </label>
                <select
                  value={filters.segment}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      segment:
                        (e.target.value as DriverPerformanceSegment | "all") ||
                        "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="top">Top</option>
                  <option value="ok">OK</option>
                  <option value="risk">Risiko</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Ranking table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-1">Fahrer</th>
                    <th className="px-2 py-1">Einsatz</th>
                    <th className="px-2 py-1">Zuverlässigkeit</th>
                    <th className="px-2 py-1">Compliance</th>
                    <th className="px-2 py-1">Score</th>
                    <th className="px-2 py-1 text-right">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerformances.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-2 py-6 text-center text-xs text-slate-500"
                      >
                        Keine Fahrer für diese Filter im gewählten Zeitraum.
                      </td>
                    </tr>
                  )}

                  {filteredPerformances.map((p) => (
                    <tr
                      key={`${p.driverId}-${p.periodId}`}
                      className="cursor-pointer rounded-xl bg-slate-50 hover:bg-slate-100"
                      onClick={() => {
                        window.location.href = `/hr/leistungsuebersicht/${p.driverId}?period=${p.periodId}`;
                      }}
                    >
                      {/* Fahrer */}
                      <td className="px-2 py-2 align-top">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                            {p.driverInitials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-900">
                              {p.driverName}
                            </span>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                              {p.location && <span>{p.location}</span>}
                              <span>·</span>
                              <span>
                                {p.driverStatus === "active"
                                  ? "Aktiv"
                                  : p.driverStatus === "onboarding"
                                  ? "Onboarding"
                                  : p.driverStatus === "blocked"
                                  ? "Blockiert"
                                  : "Inaktiv"}
                              </span>
                            </div>
                            <div className="mt-0.5">
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${segmentClasses(
                                  p.segment,
                                )}`}
                              >
                                {segmentLabel(p.segment)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Einsatz */}
                      <td className="px-2 py-2 align-top">
                        <div className="text-xs text-slate-900">
                          {p.hours.toFixed(0)} h · {p.shifts} Schichten
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          Ø {(p.hours / Math.max(p.shifts, 1)).toFixed(1)} h/Schicht
                        </div>
                      </td>

                      {/* Zuverlässigkeit */}
                      <td className="px-2 py-2 align-top">
                        <div className="text-xs text-slate-900">
                          {percentLabel(p.onTimeRate)} pünktlich
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {p.noShows} No-Shows · {p.lateShifts} verspätete
                          Schichten
                        </div>
                        {p.complaints > 0 && (
                          <div className="mt-0.5 text-[11px] text-red-600">
                            {p.complaints} Beschwerden
                          </div>
                        )}
                      </td>

                      {/* Compliance */}
                      <td className="px-2 py-2 align-top">
                        {p.complianceIssues === 0 ? (
                          <div className="text-xs text-emerald-700">
                            Dokumente & Verhalten: OK
                          </div>
                        ) : (
                          <div className="text-xs text-amber-700">
                            {p.complianceIssues} Compliance-Issue(s)
                          </div>
                        )}
                        <button
                          type="button"
                          className="mt-0.5 text-[11px] text-indigo-600 hover:text-indigo-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/hr/dokumente?driverId=${p.driverId}`;
                          }}
                        >
                          Dokumente prüfen
                        </button>
                      </td>

                      {/* Score */}
                      <td className="px-2 py-2 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-12 text-xs font-semibold text-slate-900">
                            {p.score}
                          </div>
                          <div className="flex-1">
                            <div className="h-1.5 w-full rounded-full bg-slate-200">
                              <div
                                className={`h-1.5 rounded-full ${scoreBarColor(
                                  p.score,
                                )}`}
                                style={{ width: `${p.score}%` }}
                              />
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-500">
                              0–100 Score (Mock-Formel)
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Aktion */}
                      <td
                        className="px-2 py-2 align-top text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:border-slate-300"
                          onClick={() => {
                            window.location.href = `/hr/leistungsuebersicht/${p.driverId}?period=${p.periodId}`;
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </PageState>
    </>
  );
}

