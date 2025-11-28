// Shared HR dashboard types

export type HRKpiTone = "default" | "success" | "warning" | "danger";

export type HRKpi = {
  id: string;
  label: string;
  value: string | number;
  tone: HRKpiTone;
  href: string;
};

export type HRStatusSummary = {
  absentToday: number;
  contractsExpiringToday: number;
  missingDocsToday: number;
  daysUntilPayroll: number;
};

// Driver-level shared types

export type DriverStatus =
  | "active"
  | "onboarding"
  | "incomplete"
  | "blocked"
  | "inactive";

export type DriverDocumentStatus = "ok" | "attention" | "missing";

export type HRDriverStatus = DriverStatus;

export type HRDriverPreview = {
  id: string;
  name: string;
  status: HRDriverStatus;
  docsStatus: DriverDocumentStatus;
  contractStatus: string;
  payrollStatus: string;
  href: string;
};

export type HRDashboardData = {
  kpis: HRKpi[];
  statusSummary: HRStatusSummary;
  driverPreviews: HRDriverPreview[];
  actionItems: HRActionItem[];
  events: HREventItem[];
};

export type HRActionSeverity = "high" | "medium" | "low";

export type HRActionItem = {
  id: string;
  label: string;
  severity: HRActionSeverity;
  href: string;
};

export type HREventItem = {
  id: string;
  label: string;
  timestampLabel: string;
};

// Fahrer list types

export type DriverEmploymentType =
  | "vollzeit"
  | "teilzeit"
  | "minijob"
  | "werkstudent"
  | "other";

export type DriverListItem = {
  id: string;
  fullName: string;
  initials: string;
  employmentType?: DriverEmploymentType;
  status: DriverStatus;
  docsStatus: DriverDocumentStatus;
  vehicleLabel?: string;
  lastShiftLabel: string;
  hoursLast7Days: number;
  issuesLabel?: string;
};

// Fahrer detail types

export type DriverDocumentType =
  | "license"
  | "id"
  | "contract"
  | "workPermit";

export type DriverDocumentState = "valid" | "expiring" | "missing";

export type DriverDocument = {
  id: string;
  label: string;
  type: DriverDocumentType;
  state: DriverDocumentState;
  statusLabel: string;
  expiryLabel?: string;
};

export type DriverContractSnapshot = {
  id: string;
  label: string;
  typeLabel: string;
  startDateLabel: string;
  endDateLabel?: string;
  isActive: boolean;
};

export type DriverTimeSnapshot = {
  lastShiftLabel: string;
  hoursLast7Days: number;
  hoursLast30Days: number;
};

export type DriverAbsenceSnapshot = {
  nextVacationLabel?: string;
  openSickDaysLabel?: string;
};

export type DriverNote = {
  id: string;
  dateLabel: string;
  content: string;
};

export type DriverDetail = {
  id: string;
  fullName: string;
  subtitle: string;
  status: DriverStatus;
  isBlocked: boolean;
  isDeployable: boolean;
  deployabilityLabel: string;
  locationLabel: string;
  supervisorLabel?: string;
  employmentType: DriverEmploymentType;
  employmentSinceLabel: string;
  basePayLabel: string;
  shiftLengthLabel: string;
  payDetailsLinkHref: string;
  vehicleLabel?: string;
  vehicleSecondaryLabel?: string;
  documents: DriverDocument[];
  contracts: {
    active?: DriverContractSnapshot;
    history: DriverContractSnapshot[];
  };
  time: DriverTimeSnapshot;
  absences: DriverAbsenceSnapshot;
  notes: DriverNote[];
};
