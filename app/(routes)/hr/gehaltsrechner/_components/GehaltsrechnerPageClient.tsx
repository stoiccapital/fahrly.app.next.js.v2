"use client";

import { useMemo, useState } from "react";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  DriverPayrunLine,
  DriverPayrunStatus,
  PayrunKpis,
  PayrunPeriod,
} from "@/app/(routes)/hr/_types";

type GehaltsrechnerPageClientProps = {
  periods: PayrunPeriod[];
  lines: DriverPayrunLine[];
  defaultPeriodId: string;
  initialKpis: PayrunKpis;
};

type FiltersState = {
  status: DriverPayrunStatus | "all";
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function computeKpisForPeriod(lines: DriverPayrunLine[]): PayrunKpis {
  const driverIds = new Set(lines.map((l) => l.driverId));
  const driverCount = driverIds.size;

  const grossTotal = lines.reduce((sum, l) => sum + l.grossTotal, 0);
  const employerCostEstimate = Math.round(grossTotal * 1.18 * 100) / 100;

  const openReviewDriverCount = lines.filter((l) =>
    l.status === "open" || l.status === "reviewed",
  ).length;

  const incompleteDataDriverCount = lines.filter((l) => l.hasIncompleteData)
    .length;

  return {
    driverCount,
    grossTotal: Math.round(grossTotal * 100) / 100,
    employerCostEstimate,
    openReviewDriverCount,
    incompleteDataDriverCount,
  };
}

function statusLabel(status: DriverPayrunStatus): string {
  switch (status) {
    case "open":
      return "Offen";
    case "reviewed":
      return "Geprüft";
    case "approved":
      return "Freigeben";
    case "exported":
      return "Exportiert";
  }
}

function statusClasses(status: DriverPayrunStatus): string {
  switch (status) {
    case "open":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "reviewed":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "exported":
      return "bg-sky-50 text-sky-700 border-sky-200";
  }
}

function driverStatusLabel(status: DriverPayrunLine["driverStatus"]): string {
  switch (status) {
    case "active":
      return "Aktiv";
    case "onboarding":
      return "Onboarding";
    case "blocked":
      return "Blockiert";
    case "inactive":
      return "Inaktiv";
    default:
      return String(status);
  }
}

function driverStatusClasses(status: DriverPayrunLine["driverStatus"]): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "onboarding":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "blocked":
      return "bg-red-50 text-red-700 border-red-200";
    case "inactive":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function GehaltsrechnerPageClient({
  periods,
  lines: linesFromServer,
  defaultPeriodId,
}: GehaltsrechnerPageClientProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(defaultPeriodId);
  const [filters, setFilters] = useState<FiltersState>({ status: "all" });
  const [lines, setLines] = useState<DriverPayrunLine[]>(linesFromServer);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const selectedPeriod = useMemo(
    () => periods.find((p) => p.id === selectedPeriodId) ?? periods[0],
    [periods, selectedPeriodId],
  );

  const linesForPeriod = useMemo(
    () =>
      lines.filter((l) => {
        if (l.periodId !== selectedPeriod.id) return false;

        if (filters.status !== "all" && l.status !== filters.status) {
          return false;
        }

        return true;
      }),
    [lines, selectedPeriod.id, filters.status],
  );

  const kpis = useMemo(
    () => computeKpisForPeriod(linesForPeriod),
    [linesForPeriod],
  );

  const selectedLine = useMemo(
    () =>
      selectedDriverId
        ? linesForPeriod.find((l) => l.driverId === selectedDriverId) ?? null
        : null,
    [linesForPeriod, selectedDriverId],
  );

  function goToPreviousPeriod() {
    const idx = periods.findIndex((p) => p.id === selectedPeriod.id);
    if (idx < 0) return;
    const nextIdx = Math.min(Math.max(idx - 1, 0), periods.length - 1);
    setSelectedPeriodId(periods[nextIdx].id);
    setSelectedDriverId(null);
  }

  function goToNextPeriod() {
    const idx = periods.findIndex((p) => p.id === selectedPeriod.id);
    if (idx < 0) return;
    const nextIdx = Math.min(Math.max(idx + 1, 0), periods.length - 1);
    setSelectedPeriodId(periods[nextIdx].id);
    setSelectedDriverId(null);
  }

  function setStatus(driverId: string, status: DriverPayrunStatus) {
    setLines((prev) =>
      prev.map((l) =>
        l.driverId === driverId && l.periodId === selectedPeriod.id
          ? { ...l, status }
          : l,
      ),
    );
  }

  function kpiCardClasses(active: boolean): string {
    return active
      ? "cursor-pointer border-indigo-200 bg-indigo-50 shadow-sm"
      : "cursor-pointer hover:shadow-md";
  }

  function updateBonus(
    driverId: string,
    bonusId: string,
    field: "label" | "amount",
    value: string,
  ) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.driverId !== driverId || l.periodId !== selectedPeriod.id) {
          return l;
        }

        const bonuses = l.bonuses.map((b) => {
          if (b.id !== bonusId) return b;

          if (field === "label") {
            return { ...b, label: value };
          }

          const parsed = Number(value.replace(",", "."));
          return { ...b, amount: isNaN(parsed) ? 0 : parsed };
        });

        const updated: DriverPayrunLine = {
          ...l,
          bonuses,
        };
        // recompute grossTotal
        const regular =
          updated.regularHours * updated.baseRatePerHour;
        const night =
          updated.nightHours * updated.baseRatePerHour * 1.5;
        const weekend =
          updated.weekendHours * updated.baseRatePerHour * 1.5;
        const bonusesSum = updated.bonuses.reduce(
          (sum, b) => sum + b.amount,
          0,
        );
        const deductionsSum = updated.deductions.reduce(
          (sum, d) => sum + d.amount,
          0,
        );
        updated.grossTotal =
          Math.round(
            (regular + night + weekend + bonusesSum - deductionsSum) * 100,
          ) / 100;

        return updated;
      }),
    );
  }

  function updateDeduction(
    driverId: string,
    deductionId: string,
    field: "label" | "amount",
    value: string,
  ) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.driverId !== driverId || l.periodId !== selectedPeriod.id) {
          return l;
        }

        const deductions = l.deductions.map((d) => {
          if (d.id !== deductionId) return d;

          if (field === "label") {
            return { ...d, label: value };
          }

          const parsed = Number(value.replace(",", "."));
          return { ...d, amount: isNaN(parsed) ? 0 : parsed };
        });

        const updated: DriverPayrunLine = {
          ...l,
          deductions,
        };
        // recompute grossTotal
        const regular =
          updated.regularHours * updated.baseRatePerHour;
        const night =
          updated.nightHours * updated.baseRatePerHour * 1.5;
        const weekend =
          updated.weekendHours * updated.baseRatePerHour * 1.5;
        const bonusesSum = updated.bonuses.reduce(
          (sum, b) => sum + b.amount,
          0,
        );
        const deductionsSum = updated.deductions.reduce(
          (sum, d) => sum + d.amount,
          0,
        );
        updated.grossTotal =
          Math.round(
            (regular + night + weekend + bonusesSum - deductionsSum) * 100,
          ) / 100;

        return updated;
      }),
    );
  }

  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="Gehaltsrechner"
        description="Stunden und Modelle zusammenführen, um Auszahlungen pro Fahrer und Zeitraum zu berechnen."
        primaryAction={
          <Button
            type="button"
            onClick={() => {
              // v1: Werte werden laufend berechnet – später: Trigger für echte Payruns
            }}
          >
            Abrechnung für diesen Zeitraum berechnen
          </Button>
        }
        secondaryActions={
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
              Zeitraum: Monat
            </span>
          </div>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* Period selector */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Abrechnungszeitraum</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-800">
                  {selectedPeriod.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousPeriod}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-slate-300"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goToNextPeriod}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-slate-300"
                >
                  ›
                </button>
              </div>
            </div>
          </Card>

          {/* KPI strip */}
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
                Fahrer in Abrechnung
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {kpis.driverCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Fahrer mit Stunden in diesem Zeitraum.
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
                Gesamtauszahlung (brutto)
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {formatCurrency(kpis.grossTotal)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Summe aller Fahrer in diesem Zeitraum.
              </div>
            </Card>

            <Card
              className={kpiCardClasses(
                filters.status === "open" || filters.status === "reviewed",
              )}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "open",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Offene Prüfungen
              </div>
              <div className="mt-1 text-xl font-semibold text-amber-600">
                {kpis.openReviewDriverCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Fahrer, deren Abrechnung noch nicht freigegeben ist.
              </div>
            </Card>

            <Card
              className={kpiCardClasses(false)}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status,
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Unvollständige Daten
              </div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {kpis.incompleteDataDriverCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Fahrer mit fehlenden Stammdaten/Zeiten (Mock-Indikator).
              </div>
            </Card>
          </div>

          {/* Filter bar */}
          <Card>
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: (e.target.value as DriverPayrunStatus | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="open">Offen</option>
                  <option value="reviewed">Geprüft</option>
                  <option value="approved">Freigeben</option>
                  <option value="exported">Exportiert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Zeitraum
                </label>
                <input
                  type="text"
                  value={`${selectedPeriod.startDate} – ${selectedPeriod.endDate}`}
                  readOnly
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Hinweis
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  Gehaltsrechner nutzt Stunden (Zeiterfassung) + Modelle
                  (Fahrer). In v1 sind die Werte statische Mocks.
                </p>
              </div>
            </div>
          </Card>

          {/* Main table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-1">Fahrer</th>
                    <th className="px-2 py-1">Stunden (Zeiterfassung)</th>
                    <th className="px-2 py-1">Vergütungsmodell</th>
                    <th className="px-2 py-1">Zuschläge</th>
                    <th className="px-2 py-1">Abzüge</th>
                    <th className="px-2 py-1">Gesamt (Brutto)</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {linesForPeriod.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-2 py-6 text-center text-xs text-slate-500"
                      >
                        Keine Fahrer in der Abrechnung für diesen Zeitraum und
                        diese Filter.
                      </td>
                    </tr>
                  )}

                  {linesForPeriod.map((line) => {
                    const totalBonuses = line.bonuses.reduce(
                      (sum, b) => sum + b.amount,
                      0,
                    );
                    const totalDeductions = line.deductions.reduce(
                      (sum, d) => sum + d.amount,
                      0,
                    );

                    const totalHours =
                      line.regularHours +
                      line.nightHours +
                      line.weekendHours;

                    return (
                      <tr key={`${line.driverId}-${line.periodId}`} className="rounded-xl bg-slate-50">
                        <td className="px-2 py-2 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                              {line.driverInitials}
                            </div>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => setSelectedDriverId(line.driverId)}
                                className="text-left text-xs font-medium text-indigo-600 hover:text-indigo-700"
                              >
                                {line.driverName}
                              </button>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 ${driverStatusClasses(
                                    line.driverStatus,
                                  )}`}
                                >
                                  {driverStatusLabel(line.driverStatus)}
                                </span>
                                {line.depotLabel && (
                                  <span>{line.depotLabel}</span>
                                )}
                                {line.hasIncompleteData && (
                                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                                    Daten unvollständig
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-slate-900">
                            {totalHours.toFixed(1).replace(".", ",")} h
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            Regulär: {line.regularHours.toFixed(1).replace(".", ",")} h · Nacht:{" "}
                            {line.nightHours.toFixed(1).replace(".", ",")} h · WE:{" "}
                            {line.weekendHours.toFixed(1).replace(".", ",")} h
                          </div>
                        </td>

                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-slate-900">
                            {formatCurrency(line.baseRatePerHour)}/h
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            Modell: Stundenlohn (Mock)
                          </div>
                        </td>

                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-emerald-700">
                            {formatCurrency(totalBonuses)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            {line.bonuses.length} Position
                            {line.bonuses.length === 1 ? "" : "en"}
                          </div>
                        </td>

                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-red-700">
                            {formatCurrency(totalDeductions)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            {line.deductions.length} Position
                            {line.deductions.length === 1 ? "" : "en"}
                          </div>
                        </td>

                        <td className="px-2 py-2 align-top">
                          <div className="text-xs font-semibold text-slate-900">
                            {formatCurrency(line.grossTotal)}
                          </div>
                        </td>

                        <td className="px-2 py-2 align-top">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClasses(
                              line.status,
                            )}`}
                          >
                            {statusLabel(line.status)}
                          </span>
                        </td>

                        <td className="px-2 py-2 align-top text-right">
                          <div className="flex flex-wrap justify-end gap-1 text-[11px]">
                            <button
                              type="button"
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600 hover:border-slate-300"
                              onClick={() => setSelectedDriverId(line.driverId)}
                            >
                              Details
                            </button>
                            {line.status !== "approved" && (
                              <button
                                type="button"
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 hover:border-emerald-300"
                                onClick={() =>
                                  setStatus(line.driverId, "approved")
                                }
                              >
                                Freigeben
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {linesForPeriod.length > 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-2 py-3 text-right text-xs font-medium text-slate-600"
                      >
                        Summe Brutto:
                      </td>
                      <td className="px-2 py-3 text-xs font-semibold text-slate-900">
                        {formatCurrency(kpis.grossTotal)}
                      </td>
                      <td
                        colSpan={2}
                        className="px-2 py-3 text-right text-[11px] text-slate-500"
                      >
                        Geschätzte Arbeitgeberkosten:{" "}
                        <span className="font-medium">
                          {formatCurrency(kpis.employerCostEstimate)}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Detail side panel (simple card below for v1) */}
          {selectedLine && (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-slate-900">
                    Abrechnung für {selectedLine.driverName}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Zeitraum: {selectedPeriod.label}. So setzt sich der Betrag
                    zusammen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDriverId(null)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Schließen
                </button>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-3 text-xs text-slate-700">
                {/* Grunddaten */}
                <div className="space-y-2">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Grunddaten
                    </div>
                    <div className="mt-1 space-y-1">
                      <div>
                        Vergütungsmodell:{" "}
                        <span className="font-medium">
                          {formatCurrency(selectedLine.baseRatePerHour)}/h
                        </span>
                      </div>
                      <div>
                        Fahrerstatus:{" "}
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${driverStatusClasses(
                            selectedLine.driverStatus,
                          )}`}
                        >
                          {driverStatusLabel(selectedLine.driverStatus)}
                        </span>
                      </div>
                      {selectedLine.depotLabel && (
                        <div>Standort: {selectedLine.depotLabel}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Links
                    </div>
                    <div className="mt-1 space-y-1">
                      <a
                        href={`/hr/fahrer/${selectedLine.driverId}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:border-slate-300"
                      >
                        Fahrerprofil öffnen
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Status
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <select
                        value={selectedLine.status}
                        onChange={(e) =>
                          setStatus(
                            selectedLine.driverId,
                            e.target.value as DriverPayrunStatus,
                          )
                        }
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="open">Offen</option>
                        <option value="reviewed">Geprüft</option>
                        <option value="approved">Freigeben</option>
                        <option value="exported">Exportiert</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Stunden & Schichten */}
                <div className="space-y-2">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Stunden & Schichten (Mock)
                    </div>
                    <div className="mt-1 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>Reguläre Stunden</span>
                        <span>
                          {selectedLine.regularHours
                            .toFixed(1)
                            .replace(".", ",")}{" "}
                          h ·{" "}
                          {formatCurrency(
                            selectedLine.regularHours *
                              selectedLine.baseRatePerHour,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nachtstunden</span>
                        <span>
                          {selectedLine.nightHours
                            .toFixed(1)
                            .replace(".", ",")}{" "}
                          h ·{" "}
                          {formatCurrency(
                            selectedLine.nightHours *
                              selectedLine.baseRatePerHour *
                              1.5,
                          )}{" "}
                          (inkl. Zuschlag)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wochenendstunden</span>
                        <span>
                          {selectedLine.weekendHours
                            .toFixed(1)
                            .replace(".", ",")}{" "}
                          h ·{" "}
                          {formatCurrency(
                            selectedLine.weekendHours *
                              selectedLine.baseRatePerHour *
                              1.5,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="flex justify-between text-[11px] font-medium text-slate-700">
                      <span>Summe Stundenlohn (Mock)</span>
                      <span>
                        {formatCurrency(
                          selectedLine.regularHours *
                            selectedLine.baseRatePerHour +
                            selectedLine.nightHours *
                              selectedLine.baseRatePerHour *
                              1.5 +
                            selectedLine.weekendHours *
                              selectedLine.baseRatePerHour *
                              1.5,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Zuschläge & Abzüge + Endbetrag */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Zuschläge &amp; Boni
                    </div>
                    <div className="mt-1 space-y-1 text-[11px]">
                      {selectedLine.bonuses.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <input
                            type="text"
                            value={b.label}
                            onChange={(e) =>
                              updateBonus(
                                selectedLine.driverId,
                                b.id,
                                "label",
                                e.target.value,
                              )
                            }
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800"
                          />
                          <input
                            type="number"
                            step="1"
                            value={b.amount}
                            onChange={(e) =>
                              updateBonus(
                                selectedLine.driverId,
                                b.id,
                                "amount",
                                e.target.value,
                              )
                            }
                            className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-[11px] text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Abzüge
                    </div>
                    <div className="mt-1 space-y-1 text-[11px]">
                      {selectedLine.deductions.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <input
                            type="text"
                            value={d.label}
                            onChange={(e) =>
                              updateDeduction(
                                selectedLine.driverId,
                                d.id,
                                "label",
                                e.target.value,
                              )
                            }
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800"
                          />
                          <input
                            type="number"
                            step="1"
                            value={d.amount}
                            onChange={(e) =>
                              updateDeduction(
                                selectedLine.driverId,
                                d.id,
                                "amount",
                                e.target.value,
                              )
                            }
                            className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-[11px] text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2 text-[11px]">
                    <div className="flex justify-between">
                      <span>Brutto-Auszahlung</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedLine.grossTotal)}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      Hinweis: v1 zeigt eine vereinfachte, nicht rechtlich
                      bindende Berechnung.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </PageState>
    </>
  );
}

