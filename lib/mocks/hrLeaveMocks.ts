import type { LeaveRequest, LeaveStatus, LeaveType } from "@/app/(routes)/hr/_types";
import { mockShiftDrivers } from "@/lib/mocks/hrShiftMocks";

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

function createLeaveRequest(params: {
  id: string;
  driverId: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  fullDay?: boolean;
  startTime?: string;
  endTime?: string;
  driverComment?: string;
  managerComment?: string;
  approverName?: string;
  createdAt: string;
  updatedAt: string;
  conflictSummary?: LeaveRequest["conflictSummary"];
}): LeaveRequest {
  const meta = getDriverMeta(params.driverId);

  return {
    id: params.id,
    driverId: params.driverId,
    driverName: meta.name,
    driverInitials: meta.initials,
    driverStatus: meta.status,
    depotLabel: meta.depotLabel,
    type: params.type,
    status: params.status,
    startDate: params.startDate,
    endDate: params.endDate,
    fullDay: params.fullDay ?? true,
    startTime: params.startTime,
    endTime: params.endTime,
    driverComment: params.driverComment,
    managerComment: params.managerComment,
    approverName: params.approverName,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    conflictSummary: params.conflictSummary,
  };
}

export const mockLeaveRequests: LeaveRequest[] = [
  createLeaveRequest({
    id: "leave-1",
    driverId: "driver-max",
    type: "vacation",
    status: "pending",
    startDate: "2026-03-10",
    endDate: "2026-03-14",
    driverComment: "Familienurlaub, bereits gebucht.",
    managerComment: undefined,
    approverName: undefined,
    createdAt: "2026-02-21T09:32:00.000Z",
    updatedAt: "2026-02-21T09:32:00.000Z",
    conflictSummary: {
      affectedShiftCount: 3,
      hasUncoveredShifts: true,
      locationLabel: "Berlin",
      otherAbsentCountSameLocation: 2,
    },
  }),
  createLeaveRequest({
    id: "leave-2",
    driverId: "driver-ali",
    type: "sick",
    status: "approved",
    startDate: "2026-02-18",
    endDate: "2026-02-20",
    driverComment: "Krankmeldung per Telefon, Attest folgt.",
    managerComment: "Kurzfristig, Vertretung organisiert.",
    approverName: "Sarah Müller",
    createdAt: "2026-02-18T06:45:00.000Z",
    updatedAt: "2026-02-18T08:10:00.000Z",
    conflictSummary: {
      affectedShiftCount: 2,
      hasUncoveredShifts: false,
      locationLabel: "Berlin",
      otherAbsentCountSameLocation: 1,
    },
  }),
  createLeaveRequest({
    id: "leave-3",
    driverId: "driver-sara",
    type: "special",
    status: "approved",
    startDate: "2026-03-01",
    endDate: "2026-03-01",
    fullDay: false,
    startTime: "12:00",
    endTime: "18:00",
    driverComment: "Behördentermin, halber Tag.",
    managerComment: "Ok, Schicht wurde angepasst.",
    approverName: "Sarah Müller",
    createdAt: "2026-02-10T11:02:00.000Z",
    updatedAt: "2026-02-10T12:15:00.000Z",
    conflictSummary: {
      affectedShiftCount: 1,
      hasUncoveredShifts: false,
      locationLabel: "Berlin",
      otherAbsentCountSameLocation: 0,
    },
  }),
  createLeaveRequest({
    id: "leave-4",
    driverId: "driver-max",
    type: "unpaid",
    status: "rejected",
    startDate: "2026-01-15",
    endDate: "2026-01-19",
    driverComment: "Unbezahlter Urlaub angefragt.",
    managerComment: "Abgelehnt, da bereits viele Abwesenheiten im Zeitraum.",
    approverName: "Flottenleitung",
    createdAt: "2025-12-20T10:05:00.000Z",
    updatedAt: "2025-12-21T09:15:00.000Z",
    conflictSummary: {
      affectedShiftCount: 4,
      hasUncoveredShifts: true,
      locationLabel: "Berlin",
      otherAbsentCountSameLocation: 3,
    },
  }),
];

export function getMockLeaveData(): { requests: LeaveRequest[] } {
  return {
    requests: mockLeaveRequests,
  };
}

