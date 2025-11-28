import type {
  TimeEntry,
  TimeEntryDriverSummary,
  TimeEntryKpis,
} from "@/app/(routes)/hr/_types";
import {
  SHIFT_WEEK_START_DATE,
  mockShifts,
  mockShiftDrivers,
} from "@/lib/mocks/hrShiftMocks";

export const TIME_WEEK_START_DATE = SHIFT_WEEK_START_DATE;

export const mockTimeEntryDrivers: TimeEntryDriverSummary[] = mockShiftDrivers.map(
  (d) => ({
    id: d.id,
    name: d.name,
    initials: d.initials,
    depotLabel: d.depotLabel,
  }),
);

export const mockTimeEntries: TimeEntry[] = [
  {
    id: "te-1",
    driverId: "driver-max",
    date: "2025-03-10",
    start: "06:02",
    end: "14:05",
    breakMinutes: 30,
    source: "app",
    status: "approved",
    shiftId: "shift-1",
    locationLabel: "Berlin",
    note: "Leichter Stau auf dem Rückweg.",
  },
  {
    id: "te-2",
    driverId: "driver-max",
    date: "2025-03-11",
    start: "06:00",
    end: "14:30",
    breakMinutes: 30,
    source: "manual",
    status: "pending_review",
    shiftId: "shift-2",
    locationLabel: "Berlin",
    note: "Kunde bat um Verlängerung.",
  },
  {
    id: "te-3",
    driverId: "driver-ali",
    date: "2025-03-10",
    start: "22:01",
    end: "06:05",
    breakMinutes: 15,
    source: "app",
    status: "approved",
    shiftId: "shift-4",
    locationLabel: "Berlin",
  },
  {
    id: "te-4",
    driverId: "driver-ali",
    date: "2025-03-11",
    start: "21:55",
    end: "06:10",
    breakMinutes: 15,
    source: "app",
    status: "recorded",
    shiftId: "shift-5",
    locationLabel: "Berlin",
  },
  {
    id: "te-5",
    driverId: "driver-sara",
    date: "2025-03-10",
    start: "08:03",
    end: "16:01",
    breakMinutes: 30,
    source: "app",
    status: "approved",
    shiftId: "shift-7",
    locationLabel: "Berlin",
  },
  {
    id: "te-6",
    driverId: "driver-sara",
    date: "2025-03-11",
    start: "08:10",
    end: "17:30",
    breakMinutes: 30,
    source: "manual",
    status: "pending_review",
    shiftId: "shift-8",
    locationLabel: "Berlin",
  },
  {
    id: "te-7",
    driverId: "driver-sara",
    date: "2025-03-12",
    start: "08:00",
    end: "16:00",
    breakMinutes: 30,
    source: "app",
    status: "approved",
    shiftId: "shift-9",
    locationLabel: "Berlin",
  },
  {
    id: "te-8",
    driverId: "driver-max",
    date: "2025-03-13",
    start: "06:00",
    end: "18:30",
    breakMinutes: 45,
    source: "manual",
    status: "pending_review",
    shiftId: undefined,
    locationLabel: "Berlin",
    note: "Langer Tag – Sondertour.",
  },
  {
    id: "te-9",
    driverId: "driver-ali",
    date: "2025-03-12",
    start: "22:00",
    end: "06:00",
    breakMinutes: 0,
    source: "telematics",
    status: "rejected",
    shiftId: "shift-6",
    locationLabel: "Berlin",
    note: "Doppelte Übertragung, Eintrag verworfen.",
  },
  {
    id: "te-10",
    driverId: "driver-max",
    date: "2025-03-15",
    start: "09:00",
    end: "11:00",
    breakMinutes: 0,
    source: "manual",
    status: "recorded",
    shiftId: undefined,
    locationLabel: "Berlin",
    note: "Ad-hoc-Einsatz ohne geplante Schicht.",
  },
];

function calculateDurationHours(entry: TimeEntry): number {
  const [startH, startM] = entry.start.split(":").map(Number);
  const [endH, endM] = entry.end.split(":").map(Number);
  let hours = endH + endM / 60 - (startH + startM / 60);
  if (hours <= 0) hours += 24;
  const breakHours = (entry.breakMinutes ?? 0) / 60;
  return Math.max(hours - breakHours, 0);
}

function computeKpis(entries: TimeEntry[]): TimeEntryKpis {
  let totalHours = 0;
  let notApprovedCount = 0;
  let missingFromShiftCount = 0;
  let overtimeEntryCount = 0;

  for (const entry of entries) {
    const hours = calculateDurationHours(entry);
    totalHours += hours;

    if (entry.status !== "approved") {
      notApprovedCount += 1;
    }

    if (!entry.shiftId) {
      missingFromShiftCount += 1;
    }

    if (hours > 10) {
      overtimeEntryCount += 1;
    }
  }

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    notApprovedCount,
    missingFromShiftCount,
    overtimeEntryCount,
  };
}

export function getMockTimeEntryData(): {
  weekStartDate: string;
  drivers: TimeEntryDriverSummary[];
  entries: TimeEntry[];
  kpis: TimeEntryKpis;
} {
  return {
    weekStartDate: TIME_WEEK_START_DATE,
    drivers: mockTimeEntryDrivers,
    entries: mockTimeEntries,
    kpis: computeKpis(mockTimeEntries),
  };
}

