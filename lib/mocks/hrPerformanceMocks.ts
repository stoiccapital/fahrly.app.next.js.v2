import type {
  DriverPerformance,
  PerformanceKpis,
  PerformancePeriod,
} from "@/app/(routes)/hr/_types";
import { mockShiftDrivers } from "@/lib/mocks/hrShiftMocks";

const periods: PerformancePeriod[] = [
  {
    id: "2025-11",
    label: "November 2025",
    type: "month",
    startDate: "2025-11-01",
    endDate: "2025-11-30",
  },
  {
    id: "2025-10",
    label: "Oktober 2025",
    type: "month",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
  },
];

function createPerformance(params: {
  driverId: string;
  periodId: string;
  hours: number;
  shifts: number;
  onTimeRate: number;
  noShows: number;
  lateShifts: number;
  complaints: number;
  positiveFeedback: number;
  complianceIssues: number;
  revenue?: number;
  wageCost?: number;
  notes?: string[];
}): DriverPerformance {
  const driver = mockShiftDrivers.find((d) => d.id === params.driverId);

  const driverName = driver?.name ?? "Unbekannter Fahrer";
  const driverInitials = driver?.initials ?? "??";
  const driverStatus = driver?.status ?? "inactive";
  const location = driver?.depotLabel;

  // Naive score, can be replaced later:
  // Base from on-time rate and utilisation, penalties for no-shows/complaints/compliance.
  const utilisationFactor = Math.min(params.hours / 160, 1.2); // >100% slightly rewarded
  const reliabilityScore =
    params.onTimeRate * 70 -
    params.noShows * 10 -
    params.lateShifts * 1.5;
  const qualityScore = 20 - params.complaints * 5 + params.positiveFeedback * 1.5;
  const complianceScore = 10 - params.complianceIssues * 3;

  let rawScore =
    utilisationFactor * 20 +
    reliabilityScore +
    qualityScore +
    complianceScore;

  rawScore = Math.max(0, Math.min(100, rawScore));

  const score = Math.round(rawScore);

  let segment: DriverPerformance["segment"] = "ok";
  if (score >= 85) segment = "top";
  else if (score <= 60) segment = "risk";

  return {
    driverId: params.driverId,
    driverName,
    driverInitials,
    driverStatus,
    location,
    periodId: params.periodId,
    hours: params.hours,
    shifts: params.shifts,
    onTimeRate: params.onTimeRate,
    noShows: params.noShows,
    lateShifts: params.lateShifts,
    complaints: params.complaints,
    positiveFeedback: params.positiveFeedback,
    complianceIssues: params.complianceIssues,
    revenue: params.revenue,
    wageCost: params.wageCost,
    score,
    segment,
    notes: params.notes,
  };
}

const driverPerformances: DriverPerformance[] = [
  // Max – heavy user, very reliable, top performer
  createPerformance({
    driverId: "driver-max",
    periodId: "2025-11",
    hours: 168,
    shifts: 22,
    onTimeRate: 0.97,
    noShows: 0,
    lateShifts: 2,
    complaints: 0,
    positiveFeedback: 3,
    complianceIssues: 0,
    revenue: 7850,
    wageCost: 2430,
    notes: ["Extra-Lob vom Kunden für Flexibilität", "Kann Zusatzschichten übernehmen"],
  }),
  // Ali – strong but a bit chaotic (late sometimes, 1 complaint)
  createPerformance({
    driverId: "driver-ali",
    periodId: "2025-11",
    hours: 150,
    shifts: 20,
    onTimeRate: 0.9,
    noShows: 0,
    lateShifts: 5,
    complaints: 1,
    positiveFeedback: 1,
    complianceIssues: 0,
    revenue: 7020,
    wageCost: 2100,
    notes: ["Coaching empfohlen: Pünktlichkeit und Routenplanung"],
  }),
  // Sara – part-timer, good quality, low volume
  createPerformance({
    driverId: "driver-sara",
    periodId: "2025-11",
    hours: 96,
    shifts: 12,
    onTimeRate: 0.96,
    noShows: 0,
    lateShifts: 1,
    complaints: 0,
    positiveFeedback: 2,
    complianceIssues: 0,
    revenue: 4120,
    wageCost: 1380,
    notes: ["Sehr gute Rückmeldungen von Stammkunden"],
  }),
  // Risk driver – some no-shows, complaints, compliance issue
  createPerformance({
    driverId: "driver-risk-1",
    periodId: "2025-11",
    hours: 120,
    shifts: 16,
    onTimeRate: 0.82,
    noShows: 2,
    lateShifts: 6,
    complaints: 2,
    positiveFeedback: 0,
    complianceIssues: 1,
    revenue: 5400,
    wageCost: 1850,
    notes: [
      "Zwei No-Shows in der Monatsmitte",
      "Kunde hat sich über Unpünktlichkeit beschwert",
    ],
  }),
  // Low utilisation but clean behaviour – potential for more shifts
  createPerformance({
    driverId: "driver-low-util",
    periodId: "2025-11",
    hours: 64,
    shifts: 8,
    onTimeRate: 0.98,
    noShows: 0,
    lateShifts: 0,
    complaints: 0,
    positiveFeedback: 1,
    complianceIssues: 0,
    revenue: 2800,
    wageCost: 980,
    notes: ["Saubere Performance, kann mehr Schichten fahren"],
  }),
];

function computeKpis(
  periodId: string,
  performances: DriverPerformance[],
): PerformanceKpis {
  const subset = performances.filter((p) => p.periodId === periodId);
  if (subset.length === 0) {
    return {
      activeDriversInPeriod: 0,
      averageHoursPerDriver: 0,
      averageOnTimeRate: 0,
      complaintsCount: 0,
      incidentsCount: 0,
      topDriversShareOfWork: 0,
    };
  }

  const activeDriversInPeriod = subset.length;
  const totalHours = subset.reduce((sum, p) => sum + p.hours, 0);
  const totalOnTimeRate = subset.reduce((sum, p) => sum + p.onTimeRate, 0);
  const complaintsCount = subset.reduce((sum, p) => sum + p.complaints, 0);
  const incidentsCount = subset.reduce(
    (sum, p) => sum + p.noShows + p.complianceIssues,
    0,
  );

  // Top 10% by score, share of hours
  const sortedByScore = [...subset].sort((a, b) => b.score - a.score);
  const topCount = Math.max(1, Math.round(sortedByScore.length * 0.1));
  const topDrivers = sortedByScore.slice(0, topCount);
  const topHours = topDrivers.reduce((sum, p) => sum + p.hours, 0);
  const topDriversShareOfWork =
    totalHours > 0 ? topHours / totalHours : 0;

  return {
    activeDriversInPeriod,
    averageHoursPerDriver: totalHours / activeDriversInPeriod,
    averageOnTimeRate: totalOnTimeRate / activeDriversInPeriod,
    complaintsCount,
    incidentsCount,
    topDriversShareOfWork,
  };
}

const defaultPeriodId = "2025-11";

const kpisByPeriod: Record<string, PerformanceKpis> = {
  "2025-11": computeKpis(
    "2025-11",
    driverPerformances.filter((p) => p.periodId === "2025-11"),
  ),
};

export function getPerformancePeriods(): PerformancePeriod[] {
  return periods;
}

export function getDefaultPerformancePeriod(): PerformancePeriod {
  return periods.find((p) => p.id === defaultPeriodId) ?? periods[0];
}

export function getPerformanceForPeriod(
  periodId: string,
): { performances: DriverPerformance[]; kpis: PerformanceKpis } {
  const performances = driverPerformances.filter(
    (p) => p.periodId === periodId,
  );
  const kpis =
    kpisByPeriod[periodId] ??
    computeKpis(
      periodId,
      performances,
    );

  return { performances, kpis };
}

export function getDriverPerformanceForPeriod(
  driverId: string,
  periodId: string,
): DriverPerformance | undefined {
  return driverPerformances.find(
    (p) => p.driverId === driverId && p.periodId === periodId,
  );
}

