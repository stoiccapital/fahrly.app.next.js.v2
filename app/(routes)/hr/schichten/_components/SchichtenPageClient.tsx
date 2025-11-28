"use client";

import { useMemo, useState } from "react";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  Shift,
  ShiftDriverRow,
  ShiftVehicleRow,
  ShiftKpis,
  ShiftViewMode,
  ShiftType,
} from "@/app/(routes)/hr/_types";
import Link from "next/link";

type SchichtenPageClientProps = {
  weekStartDate: string;
  drivers: ShiftDriverRow[];
  vehicles: ShiftVehicleRow[];
  shifts: Shift[];
  kpis: ShiftKpis;
};

type WeekDay = {
  date: string;
  label: string;
  weekdayShort: string;
};

type FiltersState = {
  depot: string;
  shiftType: ShiftType | "all";
  viewMode: ShiftViewMode;
};

type CreateShiftDraft = {
  driverId?: string;
  vehicleId?: string;
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

function getWeekDays(startDate: string, weekOffset: number): WeekDay[] {
  const base = new Date(startDate);
  const monday = addDays(base, weekOffset * 7);

  const weekdayShort = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return Array.from({ length: 7 }).map((_, idx) => {
    const d = addDays(monday, idx);
    const date = formatDateISO(d);
    const label = d.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
    return {
      date,
      label,
      weekdayShort: weekdayShort[idx],
    };
  });
}

function getWeekLabel(days: WeekDay[]): string {
  if (days.length === 0) return "";
  const first = days[0];
  const last = days[days.length - 1];

  const firstDate = new Date(first.date);
  const lastDate = new Date(last.date);

  const startLabel = firstDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });
  const endLabel = lastDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });
  const year = firstDate.getFullYear();

  return `${startLabel} – ${endLabel} ${year}`;
}

function shiftTypeLabel(t: ShiftType): string {
  switch (t) {
    case "day":
      return "Tag";
    case "night":
      return "Nacht";
    case "weekend":
      return "Wochenende";
  }
}

function shiftStatusLabel(status: Shift["status"]): string {
  switch (status) {
    case "planned":
      return "Geplant";
    case "in_progress":
      return "Läuft";
    case "completed":
      return "Abgeschlossen";
    case "cancelled":
      return "Ausgefallen";
  }
}

function shiftStatusClasses(status: Shift["status"]): string {
  switch (status) {
    case "planned":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "in_progress":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "completed":
      return "bg-slate-50 text-slate-600 border-slate-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function shiftTypeClasses(type: ShiftType): string {
  switch (type) {
    case "day":
      return "bg-sky-50 border-sky-200 text-sky-700";
    case "night":
      return "bg-slate-900 text-slate-50 border-slate-900";
    case "weekend":
      return "bg-amber-50 border-amber-200 text-amber-700";
  }
}

export function SchichtenPageClient({
  weekStartDate,
  drivers,
  vehicles,
  shifts: shiftsFromServer,
  kpis,
}: SchichtenPageClientProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({
    depot: "",
    shiftType: "all",
    viewMode: "by_driver",
  });

  const [shifts, setShifts] = useState<Shift[]>(shiftsFromServer);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateShiftDraft>({});

  const weekDays = useMemo(
    () => getWeekDays(weekStartDate, weekOffset),
    [weekStartDate, weekOffset],
  );
  const weekLabel = useMemo(() => getWeekLabel(weekDays), [weekDays]);

  const driverMap = useMemo(() => {
    const map = new Map<string, ShiftDriverRow>();
    for (const d of drivers) {
      map.set(d.id, d);
    }
    return map;
  }, [drivers]);

  const vehicleMap = useMemo(() => {
    const map = new Map<string, ShiftVehicleRow>();
    for (const v of vehicles) {
      map.set(v.id, v);
    }
    return map;
  }, [vehicles]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      if (!weekDays.find((d) => d.date === shift.date)) {
        return false;
      }
      if (filters.shiftType !== "all" && shift.type !== filters.shiftType) {
        return false;
      }
      if (filters.depot) {
        const driver = driverMap.get(shift.driverId);
        if (!driver) return false;
        const depot = driver.depotLabel?.toLowerCase() ?? "";
        if (!depot.includes(filters.depot.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [shifts, weekDays, filters.shiftType, filters.depot, driverMap]);

  const derivedKpis: ShiftKpis = useMemo(() => {
    const plannedCount = filteredShifts.length;
    const unassignedCount = filteredShifts.filter((s) => !s.vehicleId).length;

    const hoursByDriverAndDate = new Map<string, number>();
    for (const shift of filteredShifts) {
      const key = `${shift.driverId}-${shift.date}`;
      const [startH, startM] = shift.start.split(":").map(Number);
      const [endH, endM] = shift.end.split(":").map(Number);
      let hours = endH + endM / 60 - (startH + startM / 60);
      if (hours <= 0) hours += 24;
      hoursByDriverAndDate.set(key, (hoursByDriverAndDate.get(key) ?? 0) + hours);
    }

    const overworkedDrivers = new Set<string>();
    for (const [key, hours] of hoursByDriverAndDate.entries()) {
      if (hours > 10) {
        overworkedDrivers.add(key.split("-")[0]);
      }
    }

    const overworkedCount = overworkedDrivers.size;

    return {
      plannedCount,
      unassignedCount,
      overworkedCount,
      conflictCount: kpis.conflictCount,
    };
  }, [filteredShifts, kpis.conflictCount]);

  const selectedShift = useMemo(
    () => shifts.find((s) => s.id === selectedShiftId) ?? null,
    [shifts, selectedShiftId],
  );

  function openCreateModal(draft: CreateShiftDraft) {
    setCreateDraft(draft);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setCreateDraft({});
  }

  function handleCreateSubmit(formData: FormData) {
    const driverId = (formData.get("driverId") as string) || undefined;
    const vehicleId = (formData.get("vehicleId") as string) || undefined;
    const date = (formData.get("date") as string) || undefined;
    const start = (formData.get("start") as string) || "06:00";
    const end = (formData.get("end") as string) || "14:00";
    const type = (formData.get("type") as ShiftType) || "day";

    if (!driverId || !date) {
      closeCreateModal();
      return;
    }

    const newShift: Shift = {
      id: `new-${Date.now()}`,
      driverId,
      vehicleId,
      date,
      start,
      end,
      status: "planned",
      type,
      locationLabel: undefined,
      routeLabel: undefined,
    };

    setShifts((prev) => [...prev, newShift]);
    setSelectedShiftId(newShift.id);
    closeCreateModal();
  }

  function visibleDrivers(): ShiftDriverRow[] {
    if (filters.viewMode !== "by_driver") return [];
    return drivers;
  }

  function visibleVehicles(): ShiftVehicleRow[] {
    if (filters.viewMode !== "by_vehicle") return [];
    return vehicles;
  }

  function shiftsForDriverAndDay(driverId: string, date: string): Shift[] {
    return filteredShifts.filter(
      (s) => s.driverId === driverId && s.date === date,
    );
  }

  function shiftsForVehicleAndDay(vehicleId: string, date: string): Shift[] {
    return filteredShifts.filter(
      (s) => s.vehicleId === vehicleId && s.date === date,
    );
  }

  function isWeekend(date: string): boolean {
    const d = new Date(date);
    const day = d.getDay(); // 0 = So, 6 = Sa
    return day === 0 || day === 6;
  }

  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="Schichten"
        description="Planung von Fahrern und Fahrzeugen."
        primaryAction={
          <Button onClick={() => openCreateModal({})}>Schicht anlegen</Button>
        }
        secondaryActions={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, viewMode: "by_driver" }))
                }
                className={`rounded-full px-2 py-1 ${
                  filters.viewMode === "by_driver"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Nach Fahrer
              </button>
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, viewMode: "by_vehicle" }))
                }
                className={`rounded-full px-2 py-1 ${
                  filters.viewMode === "by_vehicle"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Nach Fahrzeug
              </button>
            </div>
            <Link href="/hr/zeiterfassung">
              <Button variant="secondary" size="sm">
                Zeiterfassung öffnen
              </Button>
            </Link>
          </div>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* Week controls */}
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
                Heute
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

          {/* KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:shadow-md">
              <div className="text-xs font-medium text-slate-500">
                Geplante Schichten
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {derivedKpis.plannedCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Alle Schichten in dieser Woche.
              </div>
            </Card>
            <Card className="cursor-pointer hover:shadow-md">
              <div className="text-xs font-medium text-slate-500">
                Unbesetzte Schichten
              </div>
              <div className="mt-1 text-xl font-semibold text-amber-600">
                {derivedKpis.unassignedCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Schichten ohne Fahrzeug.
              </div>
            </Card>
            <Card className="cursor-pointer hover:shadow-md">
              <div className="text-xs font-medium text-slate-500">
                Überlastet (&gt; 10h/Tag)
              </div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {derivedKpis.overworkedCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Fahrer mit potenzieller Überlastung.
              </div>
            </Card>
            <Card className="cursor-pointer hover:shadow-md">
              <div className="text-xs font-medium text-slate-500">
                Konflikte (Doppelbelegung)
              </div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {derivedKpis.conflictCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Potenzielle Überschneidungen (Mock).
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Standort / Depot
                </label>
                <input
                  type="text"
                  value={filters.depot}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, depot: e.target.value }))
                  }
                  placeholder="z.B. Berlin"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Schicht-Typ
                </label>
                <select
                  value={filters.shiftType}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      shiftType:
                        (e.target.value as ShiftType | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="day">Tag</option>
                  <option value="night">Nacht</option>
                  <option value="weekend">Wochenende</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Ansicht
                </label>
                <div className="mt-1 inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        viewMode: "by_driver",
                      }))
                    }
                    className={`flex-1 rounded-lg px-2 py-1 ${
                      filters.viewMode === "by_driver"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Nach Fahrer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        viewMode: "by_vehicle",
                      }))
                    }
                    className={`flex-1 rounded-lg px-2 py-1 ${
                      filters.viewMode === "by_vehicle"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Nach Fahrzeug
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline grid */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="w-52 px-2 py-1">
                      {filters.viewMode === "by_driver"
                        ? "Fahrer"
                        : "Fahrzeug"}
                    </th>
                    {weekDays.map((day) => (
                      <th
                        key={day.date}
                        className="min-w-[110px] px-2 py-1 text-center"
                      >
                        <div
                          className={`inline-flex flex-col rounded-full px-2 py-1 ${
                            isWeekend(day.date)
                              ? "bg-slate-900 text-slate-50"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="text-[10px] font-medium">
                            {day.weekdayShort}
                          </span>
                          <span className="text-[10px]">{day.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filters.viewMode === "by_driver" &&
                    visibleDrivers().map((driver) => (
                      <tr key={driver.id} className="rounded-xl bg-slate-50">
                        <td className="px-2 py-2 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                              {driver.initials}
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs font-medium text-slate-900">
                                {driver.name}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {driver.roleLabel}
                                {driver.depotLabel ? ` · ${driver.depotLabel}` : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        {weekDays.map((day) => {
                          const dayShifts = shiftsForDriverAndDay(
                            driver.id,
                            day.date,
                          );
                          const hasShift = dayShifts.length > 0;

                          return (
                            <td
                              key={day.date}
                              className="px-1 py-1 align-top"
                            >
                              <div className="flex flex-col gap-1">
                                {dayShifts.map((shift) => {
                                  const vehicle = shift.vehicleId
                                    ? vehicleMap.get(shift.vehicleId)
                                    : undefined;

                                  return (
                                    <button
                                      key={shift.id}
                                      type="button"
                                      onClick={() =>
                                        setSelectedShiftId(shift.id)
                                      }
                                      className={`w-full rounded-xl border px-2 py-1 text-left text-[11px] shadow-sm hover:shadow-md ${shiftTypeClasses(
                                        shift.type,
                                      )}`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-medium">
                                          {shift.start}–{shift.end}
                                        </span>
                                        {vehicle && (
                                          <span className="truncate text-[10px] opacity-80">
                                            {vehicle.plate}
                                          </span>
                                        )}
                                      </div>
                                      {shift.routeLabel && (
                                        <div className="mt-0.5 truncate text-[10px] opacity-80">
                                          {shift.routeLabel}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}

                                {!hasShift && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCreateModal({
                                        driverId: driver.id,
                                        date: day.date,
                                      })
                                    }
                                    className="flex h-10 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400 hover:border-slate-300 hover:text-slate-600"
                                  >
                                    + Schicht
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                  {filters.viewMode === "by_vehicle" &&
                    visibleVehicles().map((vehicle) => (
                      <tr key={vehicle.id} className="rounded-xl bg-slate-50">
                        <td className="px-2 py-2 align-top">
                          <div className="flex flex-col">
                            <div className="text-xs font-medium text-slate-900">
                              {vehicle.label}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {vehicle.depotLabel}
                            </div>
                          </div>
                        </td>
                        {weekDays.map((day) => {
                          const dayShifts = shiftsForVehicleAndDay(
                            vehicle.id,
                            day.date,
                          );
                          const hasShift = dayShifts.length > 0;

                          return (
                            <td
                              key={day.date}
                              className="px-1 py-1 align-top"
                            >
                              <div className="flex flex-col gap-1">
                                {dayShifts.map((shift) => {
                                  const driver = driverMap.get(shift.driverId);

                                  return (
                                    <button
                                      key={shift.id}
                                      type="button"
                                      onClick={() =>
                                        setSelectedShiftId(shift.id)
                                      }
                                      className={`w-full rounded-xl border px-2 py-1 text-left text-[11px] shadow-sm hover:shadow-md ${shiftTypeClasses(
                                        shift.type,
                                      )}`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-medium">
                                          {shift.start}–{shift.end}
                                        </span>
                                        {driver && (
                                          <span className="truncate text-[10px] opacity-80">
                                            {driver.name}
                                          </span>
                                        )}
                                      </div>
                                      {shift.routeLabel && (
                                        <div className="mt-0.5 truncate text-[10px] opacity-80">
                                          {shift.routeLabel}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}

                                {!hasShift && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCreateModal({
                                        vehicleId: vehicle.id,
                                        date: day.date,
                                      })
                                    }
                                    className="flex h-10 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400 hover:border-slate-300 hover:text-slate-600"
                                  >
                                    + Schicht
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Shift detail panel */}
          {selectedShift && (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-slate-900">
                    Schicht-Details
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Was passiert in dieser Schicht – und ist alles sauber
                    verknüpft?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedShiftId(null)}
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
                    <div className="mt-1 flex flex-col gap-1">
                      <div>
                        <span className="text-slate-500">Datum: </span>
                        <span className="text-slate-900">
                          {new Date(selectedShift.date).toLocaleDateString(
                            "de-DE",
                            { weekday: "short", day: "2-digit", month: "2-digit" },
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Zeit: </span>
                        <span className="text-slate-900">
                          {selectedShift.start}–{selectedShift.end} (
                          {shiftTypeLabel(selectedShift.type)})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Status: </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${shiftStatusClasses(
                            selectedShift.status,
                          )}`}
                        >
                          {shiftStatusLabel(selectedShift.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Fahrer
                    </div>
                    <div className="mt-1">
                      {(() => {
                        const d = driverMap.get(selectedShift.driverId);
                        if (!d) return <span className="text-slate-400">Unbekannt</span>;
                        return (
                          <div className="flex flex-col">
                            <span className="text-slate-900">{d.name}</span>
                            <span className="text-[11px] text-slate-500">
                              {d.roleLabel}
                              {d.depotLabel ? ` · ${d.depotLabel}` : ""}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Fahrzeug
                    </div>
                    <div className="mt-1">
                      {selectedShift.vehicleId ? (
                        (() => {
                          const v = vehicleMap.get(selectedShift.vehicleId!);
                          if (!v)
                            return (
                              <span className="text-slate-400">
                                Fahrzeug nicht gefunden
                              </span>
                            );
                          return (
                            <div className="flex flex-col">
                              <span className="text-slate-900">
                                {v.label}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {v.depotLabel}
                              </span>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-slate-400">
                          Noch kein Fahrzeug zugewiesen
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Verknüpfungen
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Link
                        href={`/hr/fahrer/${selectedShift.driverId}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:border-slate-300"
                      >
                        Fahrerprofil öffnen
                      </Link>
                      {selectedShift.vehicleId && (
                        <Link
                          href={`/fleet/fahrzeuge/${selectedShift.vehicleId}`}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:border-slate-300"
                        >
                          Fahrzeug öffnen
                        </Link>
                      )}
                      <Link
                        href={`/hr/zeiterfassung?shiftId=${selectedShift.id}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:border-slate-300"
                      >
                        Zeiterfassung öffnen
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Zeiterfassung &amp; Payroll
                    </div>
                    <div className="mt-1 space-y-1 text-[11px] text-slate-600">
                      <div>Zeiterfassung: ausstehend (Mock)</div>
                      <div>Payroll: noch nicht berücksichtigt (Mock)</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Notizen zur Schicht
                    </div>
                    <textarea
                      rows={3}
                      placeholder='Kurze Hinweise wie "Kunde X", "hohes Verkehrsaufkommen" (Speichern folgt später)…'
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      disabled
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Schicht bearbeiten</Button>
                    <Button variant="secondary" size="sm">
                      Schicht duplizieren
                    </Button>
                    <Button variant="secondary" size="sm">
                      Schicht löschen
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Create Shift Modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40">
              <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-900">
                    Neue Schicht anlegen
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
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Fahrer
                    </label>
                    <select
                      name="driverId"
                      defaultValue={createDraft.driverId ?? ""}
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
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Fahrzeug (optional)
                    </label>
                    <select
                      name="vehicleId"
                      defaultValue={createDraft.vehicleId ?? ""}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Kein Fahrzeug</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600">
                        Datum
                      </label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={createDraft.date ?? weekDays[0]?.date}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Typ
                      </label>
                      <select
                        name="type"
                        defaultValue="day"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="day">Tag</option>
                        <option value="night">Nacht</option>
                        <option value="weekend">Wochenende</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Start
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
                        Ende
                      </label>
                      <input
                        type="time"
                        name="end"
                        defaultValue="14:00"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button type="submit" className="w-full">
                      Schicht speichern
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

