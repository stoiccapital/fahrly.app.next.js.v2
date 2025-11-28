import type {
  OnboardingCase,
  OnboardingDetail,
  OnboardingChecklistItem,
  OnboardingStage,
  OnboardingChecklistStatus,
  DriverDocumentState,
} from "@/app/(routes)/hr/_types";

const makeChecklistItem = (
  id: string,
  label: string,
  status: OnboardingChecklistStatus,
  required = true,
): OnboardingChecklistItem => ({
  id,
  label,
  status,
  required,
});

const onboardingCases: OnboardingCase[] = [
  {
    id: "max-schneider-onb",
    driverName: "Max Schneider",
    phone: "+49 171 1234567",
    email: "max.schneider@example.com",
    location: "Berlin",
    stage: "docs_pending",
    targetStartDateLabel: "Start: 12.12.2025",
    responsible: "Sarah Müller",
    linkedDriverId: "max-schneider",
  },
  {
    id: "hamed-khan-onb",
    driverName: "Hamed Khan",
    phone: "+49 172 9876543",
    email: "hamed.khan@example.com",
    location: "Berlin",
    stage: "contract_pending",
    targetStartDateLabel: "Start: 05.12.2025",
    responsible: "Sarah Müller",
  },
  {
    id: "sara-lehmann-onb",
    driverName: "Sara Lehmann",
    phone: "+49 160 1122334",
    email: "sara.lehmann@example.com",
    location: "Berlin",
    stage: "training",
    targetStartDateLabel: "Start: 01.12.2025",
    responsible: "Mark Fischer",
    linkedDriverId: "sara-lehmann",
  },
  {
    id: "timo-richter-onb",
    driverName: "Timo Richter",
    phone: "+49 151 3344556",
    email: "timo.richter@example.com",
    location: "Potsdam",
    stage: "lead",
    targetStartDateLabel: "Start: offen",
    responsible: "Recruiting",
  },
  {
    id: "lena-paulsen-onb",
    driverName: "Lena Paulsen",
    phone: "+49 171 5566778",
    email: "lena.paulsen@example.com",
    location: "Berlin",
    stage: "start_scheduled",
    targetStartDateLabel: "Start: 28.11.2025",
    responsible: "Sarah Müller",
    linkedDriverId: "lena-paulsen",
  },
];

const defaultChecklist: OnboardingChecklistItem[] = [
  makeChecklistItem("application", "Bewerbungsunterlagen erhalten", "done"),
  makeChecklistItem("license-check", "Führerschein geprüft", "in_progress"),
  makeChecklistItem("id-check", "Personalausweis / Pass geprüft", "open"),
  makeChecklistItem("contract-created", "Arbeitsvertrag erstellt", "done"),
  makeChecklistItem("contract-signed", "Arbeitsvertrag unterschrieben", "open"),
  makeChecklistItem("work-permit", "Arbeitsgenehmigung (falls nötig)", "open"),
  makeChecklistItem("training", "Schulung durchgeführt", "open"),
  makeChecklistItem("test-drive", "Probefahrt bestanden", "open"),
  makeChecklistItem("app-access", "Zugang zur App/Telematik eingerichtet", "open"),
  makeChecklistItem("vehicle-planned", "Fahrzeugzuweisung geplant", "open"),
];

type DocSummary = {
  id: string;
  label: string;
  state: DriverDocumentState;
  detailLabel?: string;
};

const docsForMax: DocSummary[] = [
  {
    id: "license",
    label: "Führerschein",
    state: "valid",
    detailLabel: "Gültig bis 2028",
  },
  {
    id: "id-card",
    label: "Ausweis",
    state: "valid",
    detailLabel: "Gültig bis 2030",
  },
  {
    id: "contract",
    label: "Vertrag",
    state: "missing",
    detailLabel: "Noch nicht unterschrieben",
  },
  {
    id: "work-permit",
    label: "Aufenthaltsgenehmigung",
    state: "valid",
  },
];

const docsForHamed: DocSummary[] = [
  {
    id: "license",
    label: "Führerschein",
    state: "valid",
  },
  {
    id: "id-card",
    label: "Ausweis",
    state: "expiring",
    detailLabel: "Läuft in 20 Tagen ab",
  },
  {
    id: "contract",
    label: "Vertrag",
    state: "expiring",
    detailLabel: "Vertrag liegt vor, nicht unterschrieben",
  },
];

const docsForSara: DocSummary[] = [
  {
    id: "license",
    label: "Führerschein",
    state: "valid",
  },
  {
    id: "id-card",
    label: "Ausweis",
    state: "valid",
  },
  {
    id: "contract",
    label: "Vertrag",
    state: "valid",
    detailLabel: "Unbefristet",
  },
];

const docsForLena: DocSummary[] = [
  {
    id: "license",
    label: "Führerschein",
    state: "valid",
  },
  {
    id: "id-card",
    label: "Ausweis",
    state: "valid",
  },
  {
    id: "contract",
    label: "Vertrag",
    state: "expiring",
    detailLabel: "In Erstellung",
  },
];

function countChecklist(checklist: OnboardingChecklistItem[]): {
  completed: number;
  total: number;
} {
  const total = checklist.length;
  const completed = checklist.filter((c) => c.status === "done").length;
  return { completed, total };
}

function countCriticalMissing(docs: DocSummary[]): number {
  return docs.filter((d) => d.state === "missing").length;
}

function stageLabel(stage: OnboardingStage): string {
  switch (stage) {
    case "lead":
      return "Lead / Bewerber";
    case "docs_pending":
      return "Dokumente offen";
    case "contract_pending":
      return "Vertrag offen";
    case "training":
      return "Schulung / Einweisung";
    case "start_scheduled":
      return "Start geplant";
    case "completed":
      return "Abgeschlossen";
    case "cancelled":
      return "Abgebrochen";
  }
}

const onboardingDetails: OnboardingDetail[] = [
  (() => {
    const checklist = defaultChecklist;
    const { completed, total } = countChecklist(checklist);
    const documents = docsForMax;
    const criticalMissingCount = countCriticalMissing(documents);

    return {
      id: "max-schneider-onb",
      driverName: "Max Schneider",
      stage: "docs_pending",
      stageLabel: stageLabel("docs_pending"),
      isReady: false,
      readinessLabel: "Noch nicht einsatzbereit 🔴",
      targetStartDateLabel: "Geplanter Start: 12.12.2025",

      phone: "+49 171 1234567",
      email: "max.schneider@example.com",
      preferredLanguage: "Deutsch",
      location: "Berlin Depot Nord",
      employmentType: "vollzeit",
      shiftTags: ["Nacht", "Wochenende"],
      basePayLabel: "22 €/Stunde + Bonus",
      desiredStartDateLabel: "Wunsch-Start: 12.12.2025",
      actualStartDateLabel: undefined,
      noteSummary: "Noch in Kündigungsfrist beim aktuellen Arbeitgeber.",

      checklist,
      checklistCompletedCount: completed,
      checklistTotalCount: total,

      documents,
      criticalMissingCount,

      notes: [
        {
          id: "note-1",
          dateLabel: "2025-11-20",
          content: "Vertrag per E-Mail versendet.",
        },
        {
          id: "note-2",
          dateLabel: "2025-11-22",
          content: "Kandidat hat Nachfragen zur Vergütung.",
        },
      ],

      linkedDriverId: "max-schneider",
      linkedDriverName: "Max Schneider",
    } satisfies OnboardingDetail;
  })(),
  (() => {
    const checklist = [
      makeChecklistItem("application", "Bewerbungsunterlagen erhalten", "done"),
      makeChecklistItem("license-check", "Führerschein geprüft", "done"),
      makeChecklistItem("id-check", "Personalausweis / Pass geprüft", "done"),
      makeChecklistItem("contract-created", "Arbeitsvertrag erstellt", "done"),
      makeChecklistItem("contract-signed", "Arbeitsvertrag unterschrieben", "in_progress"),
      makeChecklistItem("work-permit", "Arbeitsgenehmigung (falls nötig)", "open"),
      makeChecklistItem("training", "Schulung durchgeführt", "open"),
      makeChecklistItem("test-drive", "Probefahrt bestanden", "open"),
      makeChecklistItem("app-access", "Zugang zur App/Telematik eingerichtet", "open"),
      makeChecklistItem("vehicle-planned", "Fahrzeugzuweisung geplant", "open"),
    ];
    const { completed, total } = countChecklist(checklist);
    const documents = docsForHamed;
    const criticalMissingCount = countCriticalMissing(documents);

    return {
      id: "hamed-khan-onb",
      driverName: "Hamed Khan",
      stage: "contract_pending",
      stageLabel: stageLabel("contract_pending"),
      isReady: false,
      readinessLabel: "Noch nicht einsatzbereit 🔴",
      targetStartDateLabel: "Geplanter Start: 05.12.2025",

      phone: "+49 172 9876543",
      email: "hamed.khan@example.com",
      preferredLanguage: "Deutsch / Englisch",
      location: "Berlin",
      employmentType: "teilzeit",
      shiftTags: ["Wochenende"],
      basePayLabel: "18 €/Stunde",
      desiredStartDateLabel: "Wunsch-Start: 05.12.2025",
      actualStartDateLabel: undefined,
      noteSummary: undefined,

      checklist,
      checklistCompletedCount: completed,
      checklistTotalCount: total,

      documents,
      criticalMissingCount,

      notes: [
        {
          id: "note-1",
          dateLabel: "2025-11-18",
          content: "Erstgespräch geführt, interessiert an Nachtschichten.",
        },
      ],

      linkedDriverId: undefined,
      linkedDriverName: undefined,
    } satisfies OnboardingDetail;
  })(),
  (() => {
    const checklist: OnboardingChecklistItem[] = defaultChecklist.map((item) => ({
      ...item,
      status:
        item.id === "application" || item.id === "license-check"
          ? ("done" as OnboardingChecklistStatus)
          : ("in_progress" as OnboardingChecklistStatus),
    }));
    const { completed, total } = countChecklist(checklist);
    const documents = docsForSara;
    const criticalMissingCount = countCriticalMissing(documents);

    return {
      id: "sara-lehmann-onb",
      driverName: "Sara Lehmann",
      stage: "training",
      stageLabel: stageLabel("training"),
      isReady: true,
      readinessLabel: "Fast einsatzbereit ✅ – letzte Schritte offen",
      targetStartDateLabel: "Geplanter Start: 01.12.2025",

      phone: "+49 160 1122334",
      email: "sara.lehmann@example.com",
      preferredLanguage: "Deutsch",
      location: "Berlin Depot Süd",
      employmentType: "vollzeit",
      shiftTags: ["Frühschicht"],
      basePayLabel: "24 €/Stunde + Bonus",
      desiredStartDateLabel: "Wunsch-Start: 01.12.2025",
      actualStartDateLabel: undefined,
      noteSummary: undefined,

      checklist,
      checklistCompletedCount: completed,
      checklistTotalCount: total,

      documents,
      criticalMissingCount,

      notes: [],

      linkedDriverId: "sara-lehmann",
      linkedDriverName: "Sara Lehmann",
    } satisfies OnboardingDetail;
  })(),
  (() => {
    const checklist: OnboardingChecklistItem[] = defaultChecklist.map((item) => ({
      ...item,
      status: item.id === "application" 
        ? ("in_progress" as OnboardingChecklistStatus)
        : ("open" as OnboardingChecklistStatus),
    }));
    const { completed, total } = countChecklist(checklist);
    const documents = docsForLena;
    const criticalMissingCount = countCriticalMissing(documents);

    return {
      id: "lena-paulsen-onb",
      driverName: "Lena Paulsen",
      stage: "start_scheduled",
      stageLabel: stageLabel("start_scheduled"),
      isReady: false,
      readinessLabel: "Noch nicht einsatzbereit 🔴 – Vertrag in Arbeit",
      targetStartDateLabel: "Geplanter Start: 28.11.2025",

      phone: "+49 171 5566778",
      email: "lena.paulsen@example.com",
      preferredLanguage: "Deutsch",
      location: "Berlin",
      employmentType: "werkstudent",
      shiftTags: ["Abend", "Wochenende"],
      basePayLabel: "16 €/Stunde",
      desiredStartDateLabel: "Wunsch-Start: 28.11.2025",
      actualStartDateLabel: undefined,
      noteSummary: undefined,

      checklist,
      checklistCompletedCount: completed,
      checklistTotalCount: total,

      documents,
      criticalMissingCount,

      notes: [],

      linkedDriverId: "lena-paulsen",
      linkedDriverName: "Lena Paulsen",
    } satisfies OnboardingDetail;
  })(),
];

export function getMockOnboardingCases(): OnboardingCase[] {
  return onboardingCases;
}

export function getMockOnboardingDetail(id: string): OnboardingDetail | undefined {
  return onboardingDetails.find((onb) => onb.id === id);
}
