import type {
  DriverListItem,
  DriverDetail,
  DriverDocumentState,
} from "@/app/(routes)/hr/_types";

export const mockDriverList: DriverListItem[] = [
  {
    id: "max-schneider",
    fullName: "Max Schneider",
    initials: "MS",
    employmentType: "vollzeit",
    status: "incomplete",
    docsStatus: "missing",
    vehicleLabel: "B-MX 1234 · Model 3",
    lastShiftLabel: "gestern",
    hoursLast7Days: 38,
    issuesLabel: "2 To-Dos",
  },
  {
    id: "hamed-khan",
    fullName: "Hamed Khan",
    initials: "HK",
    employmentType: "teilzeit",
    status: "incomplete",
    docsStatus: "attention",
    vehicleLabel: "B-HK 4021 · ID.4",
    lastShiftLabel: "vor 3 Tagen",
    hoursLast7Days: 24,
    issuesLabel: "1 Sperre",
  },
  {
    id: "sara-lehmann",
    fullName: "Sara Lehmann",
    initials: "SL",
    employmentType: "vollzeit",
    status: "active",
    docsStatus: "ok",
    vehicleLabel: "B-SL 7840 · E-Klasse",
    lastShiftLabel: "heute",
    hoursLast7Days: 46,
    issuesLabel: "",
  },
  {
    id: "timo-richter",
    fullName: "Timo Richter",
    initials: "TR",
    employmentType: "minijob",
    status: "blocked",
    docsStatus: "missing",
    vehicleLabel: undefined,
    lastShiftLabel: "vor 7 Tagen",
    hoursLast7Days: 8,
    issuesLabel: "Sperre aktiv",
  },
  {
    id: "lena-paulsen",
    fullName: "Lena Paulsen",
    initials: "LP",
    employmentType: "werkstudent",
    status: "active",
    docsStatus: "attention",
    vehicleLabel: "B-LP 9911 · Caddy",
    lastShiftLabel: "heute",
    hoursLast7Days: 32,
    issuesLabel: "Dokument läuft ab",
  },
];

const makeDocument = (
  id: string,
  label: string,
  type: DriverDocument["type"],
  state: DriverDocumentState,
  expiryLabel?: string,
) => {
  const statusLabel =
    state === "valid"
      ? "Vollständig"
      : state === "expiring"
      ? "Läuft bald ab"
      : "Fehlt";

  return {
    id,
    label,
    type,
    state,
    statusLabel,
    expiryLabel,
  };
};

export const mockDriverDetails: DriverDetail[] = [
  {
    id: "max-schneider",
    fullName: "Max Schneider",
    subtitle: "Vollzeit · seit 2023 · Berlin",
    status: "incomplete",
    isBlocked: true,
    isDeployable: false,
    deployabilityLabel: "GESPERRT 🔴 – fehlende Dokumente",
    locationLabel: "Berlin Depot Nord",
    supervisorLabel: "Disponent: Jana Keller",
    employmentType: "vollzeit",
    employmentSinceLabel: "Seit März 2023",
    basePayLabel: "22 €/Stunde + Bonus",
    shiftLengthLabel: "Standard-Schicht: 8h",
    payDetailsLinkHref: "/hr/gehaltsrechner?fahrer=max-schneider",
    vehicleLabel: "B-MX 1234 · Tesla Model 3",
    vehicleSecondaryLabel: "Zugewiesen seit 2 Monaten",
    documents: [
      {
        id: "license",
        label: "Führerschein",
        type: "license",
        state: "valid",
        statusLabel: "Vollständig",
        expiryLabel: "Gültig bis 2028",
      },
      makeDocument(
        "id-card",
        "Personalausweis",
        "id",
        "expiring",
        "Läuft in 25 Tagen ab",
      ),
      makeDocument("work-contract", "Arbeitsvertrag", "contract", "missing"),
      makeDocument(
        "work-permit",
        "Aufenthalts-/Arbeitsgenehmigung",
        "workPermit",
        "valid",
        "Gültig bis 2027",
      ),
    ],
    contracts: {
      active: {
        id: "main-2023",
        label: "Vollzeitvertrag",
        typeLabel: "Unbefristet",
        startDateLabel: "Start: 01.03.2023",
        endDateLabel: undefined,
        isActive: true,
      },
      history: [
        {
          id: "probation-2023",
          label: "Probezeit",
          typeLabel: "Befristet",
          startDateLabel: "01.03.2023",
          endDateLabel: "31.08.2023",
          isActive: false,
        },
      ],
    },
    time: {
      lastShiftLabel: "Gestern, 16:00–23:00",
      hoursLast7Days: 38,
      hoursLast30Days: 162,
    },
    absences: {
      nextVacationLabel: "Nächster Urlaub: 12.12. – 18.12.",
      openSickDaysLabel: "Offene Krankentage: 0",
    },
    notes: [
      {
        id: "note-1",
        dateLabel: "2025-11-21",
        content: "Feedback vom Kunden: sehr zuverlässig.",
      },
      {
        id: "note-2",
        dateLabel: "2025-10-03",
        content: "Zu spät zur Schicht (2h).",
      },
    ],
  },
  {
    id: "sara-lehmann",
    fullName: "Sara Lehmann",
    subtitle: "Vollzeit · seit 2022 · Berlin",
    status: "active",
    isBlocked: false,
    isDeployable: true,
    deployabilityLabel: "Einsatzbereit ✅",
    locationLabel: "Berlin Depot Süd",
    supervisorLabel: "Disponent: Mark Fischer",
    employmentType: "vollzeit",
    employmentSinceLabel: "Seit Juni 2022",
    basePayLabel: "24 €/Stunde + Bonus",
    shiftLengthLabel: "Standard-Schicht: 9h",
    payDetailsLinkHref: "/hr/gehaltsrechner?fahrer=sara-lehmann",
    vehicleLabel: "B-SL 7840 · Mercedes E-Klasse",
    vehicleSecondaryLabel: "Hauptfahrer",
    documents: [
      makeDocument("license", "Führerschein", "license", "valid", "Gültig bis 2029"),
      makeDocument("id-card", "Personalausweis", "id", "valid", "Gültig bis 2030"),
      makeDocument("work-contract", "Arbeitsvertrag", "contract", "valid"),
      makeDocument("work-permit", "Aufenthalts-/Arbeitsgenehmigung", "workPermit", "valid"),
    ],
    contracts: {
      active: {
        id: "main-2022",
        label: "Vollzeitvertrag",
        typeLabel: "Unbefristet",
        startDateLabel: "Start: 01.06.2022",
        endDateLabel: undefined,
        isActive: true,
      },
      history: [],
    },
    time: {
      lastShiftLabel: "Heute, 08:00–16:00",
      hoursLast7Days: 46,
      hoursLast30Days: 180,
    },
    absences: {
      nextVacationLabel: "Nächster Urlaub: 05.01. – 10.01.",
      openSickDaysLabel: "Offene Krankentage: 1",
    },
    notes: [
      {
        id: "note-1",
        dateLabel: "2025-11-10",
        content: "Sehr gutes Feedback von Stammkunden.",
      },
    ],
  },
];

export function getMockDriverList(): DriverListItem[] {
  return mockDriverList;
}

export function getMockDriverDetail(id: string): DriverDetail | undefined {
  return mockDriverDetails.find((driver) => driver.id === id);
}

