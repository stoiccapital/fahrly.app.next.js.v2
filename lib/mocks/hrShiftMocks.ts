import type {
  Shift,
  ShiftDriverRow,
  ShiftVehicleRow,
  ShiftKpis,
} from "@/app/(routes)/hr/_types";

export const SHIFT_WEEK_START_DATE = "2025-03-10"; // Monday

export const mockShiftDrivers: ShiftDriverRow[] = [
  {
    id: "driver-max",
    name: "Max Schneider",
    initials: "MS",
    status: "active",
    depotLabel: "Berlin Depot Nord",
    roleLabel: "Fahrer",
  },
  {
    id: "driver-ali",
    name: "Ali Kaya",
    initials: "AK",
    status: "active",
    depotLabel: "Berlin Depot Süd",
    roleLabel: "Fahrer",
  },
  {
    id: "driver-sara",
    name: "Sara Lehmann",
    initials: "SL",
    status: "active",
    depotLabel: "Berlin Depot Süd",
    roleLabel: "Fahrerin",
  },
  {
    id: "driver-timo",
    name: "Timo Richter",
    initials: "TR",
    status: "inactive",
    depotLabel: "Potsdam",
    roleLabel: "Fahrer (Reserve)",
  },
];

export const mockShiftVehicles: ShiftVehicleRow[] = [
  {
    id: "vehicle-1",
    label: "B-MX 1234 · Model 3",
    plate: "B-MX 1234",
    modelLabel: "Tesla Model 3",
    depotLabel: "Berlin Depot Nord",
  },
  {
    id: "vehicle-2",
    label: "B-AK 5678 · ID.4",
    plate: "B-AK 5678",
    modelLabel: "VW ID.4",
    depotLabel: "Berlin Depot Süd",
  },
  {
    id: "vehicle-3",
    label: "B-SL 9900 · E-Klasse",
    plate: "B-SL 9900",
    modelLabel: "Mercedes E-Klasse",
    depotLabel: "Berlin Depot Süd",
  },
];

export const mockShifts: Shift[] = [
  // Week of 10.03.2025 (Mo–So)
  {
    id: "shift-1",
    driverId: "driver-max",
    vehicleId: "vehicle-1",
    date: "2025-03-10",
    start: "06:00",
    end: "14:00",
    status: "planned",
    type: "day",
    locationLabel: "Berlin",
    routeLabel: "Frühschicht Innenstadt",
  },
  {
    id: "shift-2",
    driverId: "driver-max",
    vehicleId: "vehicle-1",
    date: "2025-03-11",
    start: "06:00",
    end: "14:00",
    status: "planned",
    type: "day",
    locationLabel: "Berlin",
    routeLabel: "Frühschicht Flughafen",
  },
  {
    id: "shift-3",
    driverId: "driver-max",
    vehicleId: "vehicle-1",
    date: "2025-03-14",
    start: "14:00",
    end: "22:00",
    status: "planned",
    type: "day",
    locationLabel: "Berlin",
    routeLabel: "Spätschicht Innenstadt",
  },
  {
    id: "shift-4",
    driverId: "driver-ali",
    vehicleId: "vehicle-2",
    date: "2025-03-10",
    start: "22:00",
    end: "06:00",
    status: "planned",
    type: "night",
    locationLabel: "Berlin",
    routeLabel: "Nachtschicht City",
  },
  {
    id: "shift-5",
    driverId: "driver-ali",
    vehicleId: "vehicle-2",
    date: "2025-03-11",
    start: "22:00",
    end: "06:00",
    status: "planned",
    type: "night",
    locationLabel: "Berlin",
    routeLabel: "Nachtschicht City",
  },
  {
    id: "shift-6",
    driverId: "driver-ali",
    vehicleId: "vehicle-2",
    date: "2025-03-12",
    start: "22:00",
    end: "06:00",
    status: "planned",
    type: "night",
    locationLabel: "Berlin",
    routeLabel: "Nachtschicht City",
  },
  {
    id: "shift-7",
    driverId: "driver-sara",
    vehicleId: "vehicle-3",
    date: "2025-03-10",
    start: "08:00",
    end: "16:00",
    status: "in_progress",
    type: "day",
    locationLabel: "Berlin",
    routeLabel: "Stammkunden Ost",
  },
  {
    id: "shift-8",
    driverId: "driver-sara",
    vehicleId: "vehicle-3",
    date: "2025-03-11",
    start: "08:00",
    end: "16:00",
    status: "planned",
    type: "day",
    locationLabel: "Berlin",
    routeLabel: "Stammkunden Ost",
  },
  {
    id: "shift-9",
    driverId: "driver-sara",
    vehicleId: "vehicle-3",
    date: "2025-03-12",
    start: "08:00",
    end: "16:00",
    status: "planned",
    type: "day",
    locationLabel: "Berlin",
    routeLabel: "Stammkunden Ost",
  },
  {
    id: "shift-10",
    driverId: "driver-sara",
    vehicleId: "vehicle-3",
    date: "2025-03-15",
    start: "10:00",
    end: "18:00",
    status: "planned",
    type: "weekend",
    locationLabel: "Berlin",
    routeLabel: "Wochenenddienst City",
  },
  {
    id: "shift-11",
    driverId: "driver-max",
    vehicleId: undefined,
    date: "2025-03-13",
    start: "06:00",
    end: "14:00",
    status: "planned",
    type: "day",
    locationLabel: "Berlin",
    routeLabel: "Noch kein Fahrzeug zugewiesen",
  },
];

function computeKpis(shifts: Shift[]): ShiftKpis {
  const plannedCount = shifts.length;
  const unassignedCount = shifts.filter((s) => !s.vehicleId).length;

  // naive overworked: drivers with more than 10h in a day (mocked)
  const hoursByDriverAndDate = new Map<string, number>();

  for (const shift of shifts) {
    const key = `${shift.driverId}-${shift.date}`;
    const [startH, startM] = shift.start.split(":").map(Number);
    const [endH, endM] = shift.end.split(":").map(Number);
    let hours = endH + endM / 60 - (startH + startM / 60);
    if (hours <= 0) {
      hours += 24;
    }
    hoursByDriverAndDate.set(key, (hoursByDriverAndDate.get(key) ?? 0) + hours);
  }

  const overworkedDrivers = new Set<string>();
  for (const [key, hours] of hoursByDriverAndDate.entries()) {
    if (hours > 10) {
      overworkedDrivers.add(key.split("-")[0]);
    }
  }

  const overworkedCount = overworkedDrivers.size;

  // mock conflicts as a simple constant for now
  const conflictCount = 2;

  return {
    plannedCount,
    unassignedCount,
    overworkedCount,
    conflictCount,
  };
}

export function getMockShiftPlanningData(): {
  weekStartDate: string;
  drivers: ShiftDriverRow[];
  vehicles: ShiftVehicleRow[];
  shifts: Shift[];
  kpis: ShiftKpis;
} {
  return {
    weekStartDate: SHIFT_WEEK_START_DATE,
    drivers: mockShiftDrivers,
    vehicles: mockShiftVehicles,
    shifts: mockShifts,
    kpis: computeKpis(mockShifts),
  };
}

