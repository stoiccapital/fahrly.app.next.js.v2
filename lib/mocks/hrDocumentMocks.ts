import type {
  DocumentComplianceKpis,
  DocumentFile,
  DocumentStatus,
  DocumentType,
  DriverDocument,
  DriverDocumentCompliance,
} from "@/app/(routes)/hr/_types";
import { mockShiftDrivers } from "@/lib/mocks/hrShiftMocks";

const REQUIRED_DOCUMENT_TYPES: DocumentType[] = [
  "license",
  "id",
  "contract",
  "work_permit",
  "training",
];

function makeDoc(params: {
  driverId: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName?: string;
  validUntil?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}): DriverDocument {
  return {
    driverId: params.driverId,
    type: params.type,
    status: params.status,
    fileName: params.fileName,
    validUntil: params.validUntil,
    uploadedAt: params.uploadedAt,
    uploadedBy: params.uploadedBy,
  };
}

function computeOverallCompliance(docs: DriverDocument[]): "ready" | "incomplete" | "blocked" {
  const hasCriticalMissingOrExpired = docs.some(
    (d) =>
      (d.type === "license" || d.type === "id" || d.type === "contract") &&
      (d.status === "missing" || d.status === "expired"),
  );

  if (hasCriticalMissingOrExpired) return "blocked";

  const hasAnyMissingOrExpiring = docs.some(
    (d) => d.status === "missing" || d.status === "expiring_soon",
  );

  if (hasAnyMissingOrExpiring) return "incomplete";

  return "ready";
}

// Build per-driver compliance rows
const driverCompliances: DriverDocumentCompliance[] = mockShiftDrivers.map(
  (driver, index) => {
    const driverId = driver.id;

    // Different patterns for first few drivers to show all states
    let docs: DriverDocument[] = [];

    if (index === 0) {
      // Mostly compliant, one expiring
      docs = [
        makeDoc({
          driverId,
          type: "license",
          status: "valid",
          fileName: "fuehrerschein-max.pdf",
          validUntil: "2027-05-31",
          uploadedAt: "2024-05-01T09:00:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "id",
          status: "valid",
          fileName: "ausweis-max.pdf",
          validUntil: "2029-01-15",
          uploadedAt: "2024-05-01T09:05:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "contract",
          status: "valid",
          fileName: "arbeitsvertrag-max.pdf",
          validUntil: undefined,
          uploadedAt: "2023-11-15T10:10:00.000Z",
          uploadedBy: "Sarah Müller",
        }),
        makeDoc({
          driverId,
          type: "work_permit",
          status: "not_required",
        }),
        makeDoc({
          driverId,
          type: "training",
          status: "expiring_soon",
          fileName: "unterweisung-2024.pdf",
          validUntil: "2025-12-15",
          uploadedAt: "2024-12-01T08:00:00.000Z",
          uploadedBy: "HR",
        }),
      ];
    } else if (index === 1) {
      // Blocked: expired license
      docs = [
        makeDoc({
          driverId,
          type: "license",
          status: "expired",
          fileName: "fuehrerschein-ali.pdf",
          validUntil: "2025-01-31",
          uploadedAt: "2020-01-01T09:00:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "id",
          status: "valid",
          fileName: "ausweis-ali.pdf",
          validUntil: "2028-10-01",
          uploadedAt: "2024-01-10T12:00:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "contract",
          status: "valid",
          fileName: "arbeitsvertrag-ali.pdf",
          validUntil: undefined,
          uploadedAt: "2022-03-01T09:30:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "work_permit",
          status: "valid",
          fileName: "aufenthalt-ali.pdf",
          validUntil: "2026-07-01",
          uploadedAt: "2023-07-01T11:00:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "training",
          status: "valid",
          fileName: "unterweisung-2025.pdf",
          validUntil: "2026-01-01",
          uploadedAt: "2025-01-10T08:30:00.000Z",
          uploadedBy: "HR",
        }),
      ];
    } else if (index === 2) {
      // Incomplete: missing contract
      docs = [
        makeDoc({
          driverId,
          type: "license",
          status: "valid",
          fileName: "fuehrerschein-sara.pdf",
          validUntil: "2028-09-30",
          uploadedAt: "2024-02-01T09:00:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "id",
          status: "valid",
          fileName: "ausweis-sara.pdf",
          validUntil: "2030-04-10",
          uploadedAt: "2024-02-01T09:05:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "contract",
          status: "missing",
        }),
        makeDoc({
          driverId,
          type: "work_permit",
          status: "not_required",
        }),
        makeDoc({
          driverId,
          type: "training",
          status: "valid",
          fileName: "unterweisung-2025.pdf",
          validUntil: "2026-04-01",
          uploadedAt: "2025-01-20T08:00:00.000Z",
          uploadedBy: "HR",
        }),
      ];
    } else {
      // Defaults: mostly valid, some missing training
      docs = [
        makeDoc({
          driverId,
          type: "license",
          status: "valid",
          fileName: `fuehrerschein-${driverId}.pdf`,
          validUntil: "2027-12-31",
          uploadedAt: "2024-06-01T09:00:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "id",
          status: "valid",
          fileName: `ausweis-${driverId}.pdf`,
          validUntil: "2029-06-30",
          uploadedAt: "2024-06-01T09:05:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "contract",
          status: "valid",
          fileName: `arbeitsvertrag-${driverId}.pdf`,
          uploadedAt: "2023-10-01T09:30:00.000Z",
          uploadedBy: "HR",
        }),
        makeDoc({
          driverId,
          type: "work_permit",
          status: "not_required",
        }),
        makeDoc({
          driverId,
          type: "training",
          status: index % 3 === 0 ? "missing" : "valid",
          fileName: index % 3 === 0 ? undefined : `unterweisung-${driverId}.pdf`,
          validUntil: index % 3 === 0 ? undefined : "2026-01-01",
          uploadedAt:
            index % 3 === 0 ? undefined : "2025-01-01T10:00:00.000Z",
          uploadedBy: index % 3 === 0 ? undefined : "HR",
        }),
      ];
    }

    const overallCompliance = computeOverallCompliance(docs);

    return {
      driverId,
      driverName: driver.name,
      driverInitials: driver.initials,
      driverStatus: driver.status,
      depotLabel: driver.depotLabel,
      documents: docs,
      overallCompliance,
    };
  },
);

function computeKpis(
  compliances: DriverDocumentCompliance[],
): DocumentComplianceKpis {
  const totalDrivers = compliances.length;
  const fullyCompliantDrivers = compliances.filter(
    (c) => c.overallCompliance === "ready",
  ).length;
  const blockedDrivers = compliances.filter(
    (c) => c.overallCompliance === "blocked",
  ).length;

  let criticalExpiredDocs = 0;
  let expiringIn30Days = 0;

  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  compliances.forEach((c) => {
    c.documents.forEach((d) => {
      if (
        !d.validUntil ||
        (d.type !== "license" && d.type !== "id" && d.type !== "contract")
      ) {
        return;
      }
      const validUntil = new Date(d.validUntil);
      if (validUntil < today) {
        criticalExpiredDocs += 1;
      } else if (validUntil <= in30Days) {
        expiringIn30Days += 1;
      }
    });
  });

  return {
    fullyCompliantDrivers,
    totalDrivers,
    criticalExpiredDocs,
    expiringIn30Days,
    blockedDrivers,
  };
}

// Build file list for "Dateien" view
const documentFiles: DocumentFile[] = [];

driverCompliances.forEach((c) => {
  c.documents.forEach((d, idx) => {
    if (!d.fileName || !d.uploadedAt) return;
    documentFiles.push({
      id: `${c.driverId}-${d.type}-${idx}`,
      driverId: c.driverId,
      driverName: c.driverName,
      type: d.type,
      status: d.status,
      fileName: d.fileName,
      validUntil: d.validUntil,
      uploadedAt: d.uploadedAt,
      uploadedBy: d.uploadedBy ?? "HR",
    });
  });
});

const kpis: DocumentComplianceKpis = computeKpis(driverCompliances);

export function getMockDocumentData(): {
  requiredTypes: DocumentType[];
  compliances: DriverDocumentCompliance[];
  files: DocumentFile[];
  kpis: DocumentComplianceKpis;
} {
  return {
    requiredTypes: REQUIRED_DOCUMENT_TYPES,
    compliances: driverCompliances,
    files: documentFiles,
    kpis,
  };
}

