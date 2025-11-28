import type {
  PayrunPeriod,
  DriverPayrunLine,
  PayrunKpis,
} from "@/app/(routes)/hr/_types";
import {
  SHIFT_WEEK_START_DATE, // reuse HR week base as reference
  mockShiftDrivers,
} from "@/lib/mocks/hrShiftMocks";

const MOCK_PERIODS: PayrunPeriod[] = [
  {
    id: "2025-11",
    label: "November 2025",
    startDate: "2025-11-01",
    endDate: "2025-11-30",
  },
  {
    id: "2025-10",
    label: "Oktober 2025",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
  },
  {
    id: "2025-09",
    label: "September 2025",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
  },
];

// Helper to find driver meta by id from shift mocks
function getDriverMeta(driverId: string) {
  const d = mockShiftDrivers.find((x) => x.id === driverId);
  if (!d) {
    return {
      name: "Unbekannter Fahrer",
      initials: "??",
      status: "inactive" as const,
      depotLabel: undefined,
    };
  }
  return {
    name: d.name,
    initials: d.initials,
    status: d.status,
    depotLabel: d.depotLabel,
  };
}

// Simple multipliers for mock wages
const NIGHT_MULTIPLIER = 1.5;
const WEEKEND_MULTIPLIER = 1.5;

function computeLineGrossTotal(line: Omit<DriverPayrunLine, "grossTotal">): number {
  const regular = line.regularHours * line.baseRatePerHour;
  const night = line.nightHours * line.baseRatePerHour * NIGHT_MULTIPLIER;
  const weekend = line.weekendHours * line.baseRatePerHour * WEEKEND_MULTIPLIER;

  const bonusesSum = line.bonuses.reduce((sum, b) => sum + b.amount, 0);
  const deductionsSum = line.deductions.reduce((sum, d) => sum + d.amount, 0);

  return Math.round((regular + night + weekend + bonusesSum - deductionsSum) * 100) / 100;
}

// Mock payrun lines for November 2025
const baseLinesForNov: Omit<DriverPayrunLine, "grossTotal">[] = [
  (() => {
    const driverId = "driver-max";
    const { name, initials, status, depotLabel } = getDriverMeta(driverId);
    const baseRatePerHour = 18;

    return {
      driverId,
      driverName: name,
      driverInitials: initials,
      driverStatus: status,
      depotLabel,
      periodId: "2025-11",
      regularHours: 140,
      nightHours: 10,
      weekendHours: 12,
      baseRatePerHour,
      bonuses: [
        { id: "b1", label: "Pünktlichkeitsbonus", amount: 50 },
        { id: "b2", label: "Leistungsbonus", amount: 100 },
      ],
      deductions: [{ id: "d1", label: "Vorschuss 05.11.", amount: 80 }],
      status: "reviewed",
      hasIncompleteData: false,
    };
  })(),
  (() => {
    const driverId = "driver-ali";
    const { name, initials, status, depotLabel } = getDriverMeta(driverId);
    const baseRatePerHour = 20;

    return {
      driverId,
      driverName: name,
      driverInitials: initials,
      driverStatus: status,
      depotLabel,
      periodId: "2025-11",
      regularHours: 130,
      nightHours: 35,
      weekendHours: 4,
      baseRatePerHour,
      bonuses: [{ id: "b1", label: "Nachtzuschlag pauschal", amount: 200 }],
      deductions: [
        { id: "d1", label: "Schadensbeteiligung", amount: 120 },
        { id: "d2", label: "Sonstiger Abzug", amount: 30 },
      ],
      status: "open",
      hasIncompleteData: true,
    };
  })(),
  (() => {
    const driverId = "driver-sara";
    const { name, initials, status, depotLabel } = getDriverMeta(driverId);
    const baseRatePerHour = 22;

    return {
      driverId,
      driverName: name,
      driverInitials: initials,
      driverStatus: status,
      depotLabel,
      periodId: "2025-11",
      regularHours: 150,
      nightHours: 0,
      weekendHours: 16,
      baseRatePerHour,
      bonuses: [
        { id: "b1", label: "Feiertagszuschlag", amount: 80 },
        { id: "b2", label: "Extra-Touren", amount: 120 },
      ],
      deductions: [],
      status: "approved",
      hasIncompleteData: false,
    };
  })(),
];

const mockPayrunLines: DriverPayrunLine[] = baseLinesForNov.map((line) => ({
  ...line,
  grossTotal: computeLineGrossTotal(line),
}));

function computeKpis(lines: DriverPayrunLine[]): PayrunKpis {
  const driverIds = new Set(lines.map((l) => l.driverId));
  const driverCount = driverIds.size;

  const grossTotal = lines.reduce((sum, l) => sum + l.grossTotal, 0);
  const employerCostEstimate = Math.round(grossTotal * 1.18 * 100) / 100; // simple +18% mock overhead

  const openReviewDriverCount = lines.filter((l) =>
    l.status === "open" || l.status === "reviewed",
  ).length;

  const incompleteDataDriverCount = lines.filter((l) => l.hasIncompleteData).length;

  return {
    driverCount,
    grossTotal: Math.round(grossTotal * 100) / 100,
    employerCostEstimate,
    openReviewDriverCount,
    incompleteDataDriverCount,
  };
}

export function getMockPayrollData(): {
  periods: PayrunPeriod[];
  lines: DriverPayrunLine[];
  defaultPeriodId: string;
  kpis: PayrunKpis;
} {
  const lines = mockPayrunLines;
  const defaultPeriodId = "2025-11";
  const kpis = computeKpis(lines);

  return {
    periods: MOCK_PERIODS,
    lines,
    defaultPeriodId,
    kpis,
  };
}

