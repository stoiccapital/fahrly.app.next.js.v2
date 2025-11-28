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

export type DriverDocumentSnapshot = {
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
  documents: DriverDocumentSnapshot[];
  contracts: {
    active?: DriverContractSnapshot;
    history: DriverContractSnapshot[];
  };
  time: DriverTimeSnapshot;
  absences: DriverAbsenceSnapshot;
  notes: DriverNote[];
};

// Onboarding (pipeline) types

export type OnboardingStage =
  | "lead"
  | "docs_pending"
  | "contract_pending"
  | "training"
  | "start_scheduled"
  | "completed"
  | "cancelled";

export type OnboardingChecklistStatus = "open" | "in_progress" | "done";

export type OnboardingChecklistItem = {
  id: string;
  label: string;
  status: OnboardingChecklistStatus;
  required: boolean;
};

export type OnboardingCase = {
  id: string;
  driverName: string;
  phone: string;
  email?: string;
  location?: string;
  stage: OnboardingStage;
  targetStartDateLabel?: string;
  responsible?: string;
  linkedDriverId?: string;
};

// Detail view types

export type OnboardingDocumentSummary = {
  id: string;
  label: string;
  state: DriverDocumentState;
  detailLabel?: string;
};

export type OnboardingNote = {
  id: string;
  dateLabel: string;
  content: string;
};

export type OnboardingDetail = {
  id: string;
  driverName: string;
  stage: OnboardingStage;
  stageLabel: string;
  isReady: boolean;
  readinessLabel: string;
  targetStartDateLabel?: string;

  // Person & meta
  phone: string;
  email?: string;
  preferredLanguage?: string;
  location?: string;
  employmentType: DriverEmploymentType;
  shiftTags: string[];
  basePayLabel: string;
  desiredStartDateLabel?: string;
  actualStartDateLabel?: string;
  noteSummary?: string;

  // Checklist
  checklist: OnboardingChecklistItem[];
  checklistCompletedCount: number;
  checklistTotalCount: number;

  // Documents snapshot
  documents: OnboardingDocumentSummary[];
  criticalMissingCount: number;

  // Communication / notes
  notes: OnboardingNote[];

  // Link to Fahrer
  linkedDriverId?: string;
  linkedDriverName?: string;
};

// Schichten (shift planning) types

export type ShiftStatus = "planned" | "in_progress" | "completed" | "cancelled";

export type ShiftType = "day" | "night" | "weekend";

export type Shift = {
  id: string;
  driverId: string;
  vehicleId?: string;
  date: string; // "2025-03-10"
  start: string; // "06:00"
  end: string;   // "14:00"
  status: ShiftStatus;
  type: ShiftType;
  locationLabel?: string;
  routeLabel?: string;
};

export type ShiftDriverRow = {
  id: string;
  name: string;
  initials: string;
  status: DriverStatus;
  depotLabel?: string;
  roleLabel?: string;
};

export type ShiftVehicleRow = {
  id: string;
  label: string; // e.g. "B-MX 1234 · Model 3"
  plate: string;
  modelLabel?: string;
  depotLabel?: string;
};

export type ShiftKpis = {
  plannedCount: number;
  unassignedCount: number;
  overworkedCount: number;
  conflictCount: number;
};

export type ShiftViewMode = "by_driver" | "by_vehicle";

// Zeiterfassung (time tracking) types

export type TimeEntryStatus =
  | "recorded"
  | "pending_review"
  | "approved"
  | "rejected";

export type TimeEntrySource = "manual" | "app" | "telematics";

export type TimeEntry = {
  id: string;
  driverId: string;
  date: string; // "2025-11-28"
  start: string; // "06:00"
  end: string; // "14:00"
  breakMinutes?: number;
  source: TimeEntrySource;
  status: TimeEntryStatus;
  shiftId?: string;
  locationLabel?: string;
  note?: string;
};

export type TimeEntryDriverSummary = {
  id: string;
  name: string;
  initials: string;
  depotLabel?: string;
};

export type TimeEntryKpis = {
  totalHours: number;
  notApprovedCount: number;
  missingFromShiftCount: number;
  overtimeEntryCount: number;
};

// Gehaltsrechner (payroll helper) types

export type PayrunPeriod = {
  id: string; // e.g. "2025-11"
  label: string; // e.g. "November 2025"
  startDate: string; // "2025-11-01"
  endDate: string; // "2025-11-30"
};

export type DriverPayrunStatus = "open" | "reviewed" | "approved" | "exported";

export type DriverPayrunBonus = {
  id: string;
  label: string;
  amount: number; // positive €
};

export type DriverPayrunDeduction = {
  id: string;
  label: string;
  amount: number; // positive € (we subtract later)
};

export type DriverPayrunLine = {
  driverId: string;
  driverName: string;
  driverInitials: string;
  driverStatus: DriverStatus;
  depotLabel?: string;

  periodId: string;

  regularHours: number;
  nightHours: number;
  weekendHours: number;
  baseRatePerHour: number;

  bonuses: DriverPayrunBonus[];
  deductions: DriverPayrunDeduction[];

  grossTotal: number; // for this driver & period
  status: DriverPayrunStatus;

  hasIncompleteData?: boolean;
};

export type PayrunKpis = {
  driverCount: number;
  grossTotal: number;
  employerCostEstimate: number;
  openReviewDriverCount: number;
  incompleteDataDriverCount: number;
};

// Urlaub & Abwesenheit (leave management) types

export type LeaveType = "vacation" | "sick" | "special" | "unpaid";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveConflictSummary = {
  affectedShiftCount: number;
  hasUncoveredShifts: boolean;
  locationLabel?: string;
  otherAbsentCountSameLocation: number;
};

export type LeaveRequest = {
  id: string;
  driverId: string;
  driverName: string;
  driverInitials: string;
  driverStatus: DriverStatus;
  depotLabel?: string;

  type: LeaveType;
  status: LeaveStatus;

  startDate: string; // "2026-03-10"
  endDate: string; // "2026-03-14"
  fullDay: boolean;
  startTime?: string;
  endTime?: string;

  driverComment?: string;
  managerComment?: string;
  approverName?: string;

  createdAt: string;
  updatedAt: string;

  conflictSummary?: LeaveConflictSummary;
};

// Dokumente & Compliance (driver documents)

export type DocumentType =
  | "license"
  | "id"
  | "contract"
  | "work_permit"
  | "training"
  | "other";

export type DocumentStatus =
  | "valid"
  | "expiring_soon"
  | "expired"
  | "missing"
  | "not_required";

export type DriverDocument = {
  driverId: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName?: string;
  validUntil?: string; // ISO date
  uploadedAt?: string; // ISO
  uploadedBy?: string;
  requestedAt?: string; // for future "Dokument anfordern"
  reminderCount?: number;
};

export type DriverDocumentCompliance = {
  driverId: string;
  driverName: string;
  driverInitials: string;
  driverStatus: DriverStatus;
  depotLabel?: string;
  documents: DriverDocument[];
  overallCompliance: "ready" | "incomplete" | "blocked";
};

export type DocumentFile = {
  id: string;
  driverId: string;
  driverName: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  validUntil?: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type DocumentComplianceKpis = {
  fullyCompliantDrivers: number;
  totalDrivers: number;
  criticalExpiredDocs: number;
  expiringIn30Days: number;
  blockedDrivers: number;
};

// Verträge (contracts)

export type ContractStatus =
  | "draft"
  | "sent"
  | "signed"
  | "active"
  | "ended"
  | "rejected";

export type ContractType =
  | "full_time"
  | "part_time"
  | "mini_job"
  | "contractor";

export type BasePayType = "hourly" | "monthly" | "daily" | "per_ride";

export type Contract = {
  id: string;
  driverId: string;
  driverName: string;
  driverInitials: string;
  driverStatus: DriverStatus;

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

  mainDocumentId?: string; // link to Dokumente (DocumentFile.id)
  notes?: string;

  createdAt: string;
  updatedAt: string;
};

export type ContractKpis = {
  activeContracts: number;
  expiringIn30Days: number;
  pendingSignatures: number;
  endedLast90Days: number;
};

// Leistungsübersicht (driver performance)

export type PerformancePeriodType = "week" | "month" | "quarter";

export type PerformancePeriod = {
  id: string; // e.g. "2025-11"
  label: string; // e.g. "November 2025"
  type: PerformancePeriodType;
  startDate: string;
  endDate: string;
};

export type PerformanceKpis = {
  activeDriversInPeriod: number;
  averageHoursPerDriver: number;
  averageOnTimeRate: number; // 0–1
  complaintsCount: number;
  incidentsCount: number;
  topDriversShareOfWork: number; // 0–1, share of tours/hours by top decile
};

export type DriverPerformanceSegment =
  | "top"
  | "ok"
  | "risk";

export type DriverPerformance = {
  driverId: string;
  driverName: string;
  driverInitials: string;
  driverStatus: DriverStatus;
  location?: string;

  periodId: string;

  hours: number;
  shifts: number;

  onTimeRate: number; // 0–1
  noShows: number;
  lateShifts: number;

  complaints: number;
  positiveFeedback: number;

  complianceIssues: number; // sum of docs/behaviour issues

  revenue?: number;
  wageCost?: number;

  score: number; // 0–100
  segment: DriverPerformanceSegment;

  notes?: string[];
};
