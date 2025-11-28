import type {
  BasePayType,
  Contract,
  ContractKpis,
  ContractStatus,
  ContractType,
} from "@/app/(routes)/hr/_types";
import { mockShiftDrivers } from "@/lib/mocks/hrShiftMocks";

function createContract(params: {
  id: string;
  driverId: string;
  type: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  probationMonths?: number;
  terminationNotice?: string;
  basePayType: BasePayType;
  basePayAmount: number;
  nightBonusPercent?: number;
  weekendBonusPercent?: number;
  holidayBonusPercent?: number;
  location?: string;
  roleTitle?: string;
  expectedWeeklyHours?: number;
  shiftTypes?: ("day" | "night" | "weekend")[];
  mainDocumentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}): Contract {
  const driver = mockShiftDrivers.find((d) => d.id === params.driverId);

  const driverName = driver?.name ?? "Unbekannter Fahrer";
  const driverInitials = driver?.initials ?? "??";
  const driverStatus = driver?.status ?? "inactive";

  return {
    id: params.id,
    driverId: params.driverId,
    driverName,
    driverInitials,
    driverStatus,
    type: params.type,
    status: params.status,
    startDate: params.startDate,
    endDate: params.endDate,
    probationMonths: params.probationMonths,
    terminationNotice: params.terminationNotice,
    basePayType: params.basePayType,
    basePayAmount: params.basePayAmount,
    nightBonusPercent: params.nightBonusPercent,
    weekendBonusPercent: params.weekendBonusPercent,
    holidayBonusPercent: params.holidayBonusPercent,
    location: params.location,
    roleTitle: params.roleTitle,
    expectedWeeklyHours: params.expectedWeeklyHours,
    shiftTypes: params.shiftTypes,
    mainDocumentId: params.mainDocumentId,
    notes: params.notes,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
  };
}

const contracts: Contract[] = [
  // Vollzeit, aktiv, unbefristet
  createContract({
    id: "contract-max-fulltime-2025",
    driverId: "driver-max",
    type: "full_time",
    status: "active",
    startDate: "2025-02-01",
    endDate: undefined,
    probationMonths: 6,
    terminationNotice: "4 Wochen zum Monatsende",
    basePayType: "monthly",
    basePayAmount: 2800,
    nightBonusPercent: 25,
    weekendBonusPercent: 30,
    holidayBonusPercent: 50,
    location: "Berlin",
    roleTitle: "Fahrer",
    expectedWeeklyHours: 40,
    shiftTypes: ["day", "night", "weekend"],
    mainDocumentId: "contract-doc-max-2025",
    notes: "Einsatz hauptsächlich in Berlin Stadtgebiet.",
    createdAt: "2025-01-10T09:00:00.000Z",
    updatedAt: "2025-02-01T08:30:00.000Z",
  }),
  // Minijob, aktiv, befristet
  createContract({
    id: "contract-ali-minijob-2024",
    driverId: "driver-ali",
    type: "mini_job",
    status: "active",
    startDate: "2024-09-01",
    endDate: "2025-08-31",
    probationMonths: 3,
    terminationNotice: "2 Wochen",
    basePayType: "hourly",
    basePayAmount: 15,
    nightBonusPercent: 25,
    weekendBonusPercent: 30,
    location: "Berlin",
    roleTitle: "Fahrer (Minijob)",
    expectedWeeklyHours: 12,
    shiftTypes: ["night", "weekend"],
    mainDocumentId: "contract-doc-ali-2024",
    notes: "Fokus auf Nacht- und Wochenendschichten.",
    createdAt: "2024-08-10T10:15:00.000Z",
    updatedAt: "2024-09-01T07:45:00.000Z",
  }),
  // Freelancer (contractor), sent (waiting for signature)
  createContract({
    id: "contract-sara-freelancer-2026",
    driverId: "driver-sara",
    type: "contractor",
    status: "sent",
    startDate: "2026-01-15",
    endDate: undefined,
    probationMonths: undefined,
    terminationNotice: "14 Tage",
    basePayType: "per_ride",
    basePayAmount: 7.5,
    nightBonusPercent: 0,
    weekendBonusPercent: 10,
    location: "Hamburg",
    roleTitle: "Fahrerin (Freelancer)",
    expectedWeeklyHours: undefined,
    shiftTypes: ["day"],
    mainDocumentId: undefined,
    notes: "Freelancer-Modell mit Vergütung pro Tour.",
    createdAt: "2025-12-20T12:00:00.000Z",
    updatedAt: "2025-12-20T12:05:00.000Z",
  }),
  // Beendeter Vertrag (Vergangenheit)
  createContract({
    id: "contract-max-minijob-2023",
    driverId: "driver-max",
    type: "mini_job",
    status: "ended",
    startDate: "2023-01-01",
    endDate: "2024-01-31",
    probationMonths: 3,
    terminationNotice: "4 Wochen",
    basePayType: "hourly",
    basePayAmount: 13,
    nightBonusPercent: 20,
    weekendBonusPercent: 25,
    location: "Berlin",
    roleTitle: "Fahrer (Minijob)",
    expectedWeeklyHours: 10,
    shiftTypes: ["day", "weekend"],
    mainDocumentId: "contract-doc-max-2023",
    notes: "Alter Minijob-Vertrag vor Übernahme in Vollzeit.",
    createdAt: "2022-12-10T11:00:00.000Z",
    updatedAt: "2024-02-01T09:00:00.000Z",
  }),
  // Draft, not yet sent
  createContract({
    id: "contract-new-draft-1",
    driverId: "driver-new",
    type: "part_time",
    status: "draft",
    startDate: "2026-03-01",
    endDate: undefined,
    probationMonths: 6,
    terminationNotice: "4 Wochen zum Monatsende",
    basePayType: "hourly",
    basePayAmount: 16,
    nightBonusPercent: 25,
    weekendBonusPercent: 25,
    location: "Berlin",
    roleTitle: "Fahrer (Teilzeit)",
    expectedWeeklyHours: 25,
    shiftTypes: ["day"],
    mainDocumentId: undefined,
    notes: "Neuer Teilzeitvertrag in Vorbereitung.",
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-02-01T08:00:00.000Z",
  }),
];

function computeKpis(contracts: Contract[]): ContractKpis {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  const activeContracts = contracts.filter(
    (c) => c.status === "active",
  ).length;

  const expiringIn30Days = contracts.filter((c) => {
    if (!c.endDate) return false;
    const end = new Date(c.endDate);
    return end >= today && end <= in30Days;
  }).length;

  const pendingSignatures = contracts.filter(
    (c) => c.status === "sent" || c.status === "draft",
  ).length;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const endedLast90Days = contracts.filter((c) => {
    if (c.status !== "ended" || !c.endDate) return false;
    const end = new Date(c.endDate);
    return end >= ninetyDaysAgo && end <= today;
  }).length;

  return {
    activeContracts,
    expiringIn30Days,
    pendingSignatures,
    endedLast90Days,
  };
}

const kpis: ContractKpis = computeKpis(contracts);

export function getMockContractData(): {
  contracts: Contract[];
  kpis: ContractKpis;
} {
  return {
    contracts,
    kpis,
  };
}

export function getContractById(id: string): Contract | undefined {
  return contracts.find((c) => c.id === id);
}

