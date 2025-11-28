"use client";

import { useMemo, useState } from "react";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  DocumentComplianceKpis,
  DocumentFile,
  DocumentStatus,
  DocumentType,
  DriverDocument,
  DriverDocumentCompliance,
  DriverStatus,
} from "@/app/(routes)/hr/_types";

type DokumentePageClientProps = {
  requiredTypes: DocumentType[];
  compliancesFromServer: DriverDocumentCompliance[];
  filesFromServer: DocumentFile[];
  kpisFromServer: DocumentComplianceKpis;
};

type ViewMode = "compliance" | "files";

type FiltersState = {
  search: string;
  driverStatus: DriverStatus | "all";
  documentStatus: DocumentStatus | "all";
};

type DocumentDrawerState = {
  driverId: string;
  type: DocumentType;
} | null;

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function documentStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case "valid":
      return "Gültig";
    case "expiring_soon":
      return "Läuft bald ab";
    case "expired":
      return "Abgelaufen";
    case "missing":
      return "Fehlend";
    case "not_required":
      return "Nicht erforderlich";
  }
}

function documentStatusIcon(status: DocumentStatus): string {
  switch (status) {
    case "valid":
      return "🟢";
    case "expiring_soon":
      return "🟡";
    case "expired":
      return "🔴";
    case "missing":
      return "🔴";
    case "not_required":
      return "—";
  }
}

function documentStatusClasses(status: DocumentStatus): string {
  switch (status) {
    case "valid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "expiring_soon":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "expired":
      return "bg-red-50 text-red-700 border-red-200";
    case "missing":
      return "bg-red-50 text-red-700 border-red-200";
    case "not_required":
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function documentTypeLabel(type: DocumentType): string {
  switch (type) {
    case "license":
      return "Führerschein";
    case "id":
      return "Ausweis / Pass";
    case "contract":
      return "Arbeitsvertrag";
    case "work_permit":
      return "Aufenthaltsgenehmigung";
    case "training":
      return "Schulungsnachweis";
    case "other":
      return "Sonstige";
  }
}

function driverStatusLabel(status: DriverStatus): string {
  switch (status) {
    case "active":
      return "Aktiv";
    case "onboarding":
      return "Onboarding";
    case "blocked":
      return "Blockiert";
    case "inactive":
      return "Archiviert";
    default:
      return String(status);
  }
}

function driverStatusClasses(status: DriverStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "onboarding":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "blocked":
      return "bg-red-50 text-red-700 border-red-200";
    case "inactive":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function overallComplianceLabel(
  value: DriverDocumentCompliance["overallCompliance"],
): string {
  switch (value) {
    case "ready":
      return "Einsatzbereit";
    case "incomplete":
      return "Unvollständig";
    case "blocked":
      return "Gesperrt (Dokumente)";
  }
}

function overallComplianceClasses(
  value: DriverDocumentCompliance["overallCompliance"],
): string {
  switch (value) {
    case "ready":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "incomplete":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "blocked":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function kpiCardClasses(clickable = true): string {
  return clickable
    ? "cursor-pointer hover:shadow-md"
    : "cursor-default";
}

export function DokumentePageClient({
  requiredTypes,
  compliancesFromServer,
  filesFromServer,
  kpisFromServer,
}: DokumentePageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("compliance");
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    driverStatus: "all",
    documentStatus: "all",
  });

  const [compliances, setCompliances] =
    useState<DriverDocumentCompliance[]>(compliancesFromServer);
  const [files, setFiles] = useState<DocumentFile[]>(filesFromServer);
  const [drawerState, setDrawerState] = useState<DocumentDrawerState>(null);

  const filteredCompliances = useMemo(() => {
    return compliances.filter((row) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !row.driverName.toLowerCase().includes(q) &&
          !row.driverInitials.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (filters.driverStatus !== "all" && row.driverStatus !== filters.driverStatus) {
        return false;
      }

      if (filters.documentStatus !== "all") {
        const hasStatus = row.documents.some(
          (doc) => doc.status === filters.documentStatus,
        );
        if (!hasStatus) return false;
      }

      return true;
    });
  }, [compliances, filters]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !file.driverName.toLowerCase().includes(q) &&
          !file.fileName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (filters.documentStatus !== "all" && file.status !== filters.documentStatus) {
        return false;
      }
      return true;
    });
  }, [files, filters]);

  const selectedDocument: DriverDocument | null = useMemo(() => {
    if (!drawerState) return null;

    const row = compliances.find((c) => c.driverId === drawerState.driverId);
    if (!row) return null;

    const doc =
      row.documents.find((d) => d.type === drawerState.type) ?? null;

    return doc ?? null;
  }, [drawerState, compliances]);

  const selectedDriver: DriverDocumentCompliance | null = useMemo(() => {
    if (!drawerState) return null;

    return (
      compliances.find((c) => c.driverId === drawerState.driverId) ?? null
    );
  }, [drawerState, compliances]);

  function openDrawer(driverId: string, type: DocumentType) {
    setDrawerState({ driverId, type });
  }

  function closeDrawer() {
    setDrawerState(null);
  }

  function updateDocumentStatus(
    driverId: string,
    type: DocumentType,
    status: DocumentStatus,
  ) {
    setCompliances((prev) =>
      prev.map((row) => {
        if (row.driverId !== driverId) return row;

        const documents: DriverDocument[] = requiredTypes.map((t) => {
          const existing = row.documents.find((d) => d.type === t);
          if (t !== type) {
            return (
              existing ?? {
                driverId,
                type: t,
                status: "missing",
              }
            );
          }

          const base: DriverDocument =
            existing ??
            ({
              driverId,
              type,
            } as DriverDocument);
          return {
            ...base,
            status,
          };
        });

        const overallCompliance = (() => {
          const hasCriticalMissingOrExpired = documents.some(
            (d) =>
              (d.type === "license" ||
                d.type === "id" ||
                d.type === "contract") &&
              (d.status === "missing" || d.status === "expired"),
          );
          if (hasCriticalMissingOrExpired) return "blocked";
          const hasAnyMissingOrExpiring = documents.some(
            (d) =>
              d.status === "missing" || d.status === "expiring_soon",
          );
          if (hasAnyMissingOrExpiring) return "incomplete";
          return "ready";
        })();

        return {
          ...row,
          documents,
          overallCompliance,
        };
      }),
    );

    // Keep files list coherent in a simple way for v1
    setFiles((prev) =>
      prev.map((f) =>
        f.driverId === driverId && f.type === type
          ? {
              ...f,
              status,
            }
          : f,
      ),
    );
  }

  function setValidUntil(
    driverId: string,
    type: DocumentType,
    validUntil: string,
  ) {
    setCompliances((prev) =>
      prev.map((row) => {
        if (row.driverId !== driverId) return row;

        const documents = row.documents.map((d) =>
          d.type === type
            ? {
                ...d,
                validUntil,
                status:
                  d.status === "missing" || d.status === "not_required"
                    ? "valid"
                    : d.status,
              }
            : d,
        );

        return {
          ...row,
          documents,
        };
      }),
    );
    setFiles((prev) =>
      prev.map((f) =>
        f.driverId === driverId && f.type === type
          ? {
              ...f,
              validUntil,
            }
          : f,
      ),
    );
  }

  function simulateUploadNewVersion(
    driverId: string,
    type: DocumentType,
    fileName: string,
  ) {
    const now = new Date().toISOString();
    // Update compliance docs
    setCompliances((prev) =>
      prev.map((row) => {
        if (row.driverId !== driverId) return row;

        const documents = row.documents.map((d) =>
          d.type === type
            ? {
                ...d,
                status:
                  d.status === "missing" || d.status === "not_required"
                    ? "valid"
                    : d.status,
                fileName,
                uploadedAt: now,
                uploadedBy: "HR (Mock)",
              }
            : d,
        );

        return {
          ...row,
          documents,
        };
      }),
    );

    // Update or add file in file list
    setFiles((prev) => {
      const existingIndex = prev.findIndex(
        (f) => f.driverId === driverId && f.type === type,
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          fileName,
          uploadedAt: now,
          uploadedBy: "HR (Mock)",
          status: "valid",
        };
        return updated;
      }

      const driverRow = compliances.find((c) => c.driverId === driverId);
      if (!driverRow) return prev;

      const newFile: DocumentFile = {
        id: `${driverId}-${type}-${now}`,
        driverId,
        driverName: driverRow.driverName,
        type,
        status: "valid",
        fileName,
        uploadedAt: now,
        uploadedBy: "HR (Mock)",
        validUntil: undefined,
      };

      return [newFile, ...prev];
    });
  }

  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="Dokumente"
        description="Fahrerunterlagen, Gültigkeit und Compliance im Blick."
        primaryAction={
          <Button
            type="button"
            onClick={() => {
              // v1: open drawer in "missing" state for manual upload
              if (compliances.length > 0) {
                const first = compliances[0];
                setDrawerState({
                  driverId: first.driverId,
                  type: "license",
                });
              }
            }}
          >
            + Dokument hochladen
          </Button>
        }
        secondaryActions={
          <div className="flex items-center gap-2 text-xs">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("compliance")}
                className={`rounded-full px-3 py-1 ${
                  viewMode === "compliance"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Compliance
              </button>
              <button
                type="button"
                onClick={() => setViewMode("files")}
                className={`rounded-full px-3 py-1 ${
                  viewMode === "files"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Dateien
              </button>
            </div>
          </div>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* KPI strip */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              className={kpiCardClasses(false)}
            >
              <div className="text-xs font-medium text-slate-500">
                Fahrer mit vollständigen Dokumenten
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {kpisFromServer.fullyCompliantDrivers} /{" "}
                {kpisFromServer.totalDrivers}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Einsatzbereit ohne offene Dokumenten-Themen.
              </div>
            </Card>
            <Card
              className={kpiCardClasses(true)}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  documentStatus: "expired",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Kritische Dokumente abgelaufen
              </div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {kpisFromServer.criticalExpiredDocs}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Abgelaufene Führerscheine, Ausweise oder Verträge.
              </div>
            </Card>
            <Card
              className={kpiCardClasses(true)}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  documentStatus: "expiring_soon",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Dokumente laufen in 30 Tagen ab
              </div>
              <div className="mt-1 text-xl font-semibold text-amber-600">
                {kpisFromServer.expiringIn30Days}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Frühzeitig handeln, bevor Fahrer gesperrt werden.
              </div>
            </Card>
            <Card
              className={kpiCardClasses(true)}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  driverStatus: "blocked",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Gesperrte Fahrer (Dokumente)
              </div>
              <div className="mt-1 text-xl font-semibold text-red-600">
                {kpisFromServer.blockedDrivers}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Fahrer, die wegen Dokumenten nicht eingesetzt werden dürfen.
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Fahrer
                </label>
                <input
                  type="text"
                  placeholder="Name oder Initialen…"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Fahrerstatus
                </label>
                <select
                  value={filters.driverStatus}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      driverStatus: (e.target.value as DriverStatus | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="active">Aktiv</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="blocked">Blockiert</option>
                  <option value="inactive">Archiviert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Dokumentstatus
                </label>
                <select
                  value={filters.documentStatus}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      documentStatus:
                        (e.target.value as DocumentStatus | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="valid">Vollständig / Gültig</option>
                  <option value="expiring_soon">Bald ablaufend</option>
                  <option value="expired">Abgelaufen</option>
                  <option value="missing">Fehlend</option>
                  <option value="not_required">Nicht erforderlich</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Content: Compliance matrix or Files table */}
          {viewMode === "compliance" ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-1">Fahrer</th>
                      {requiredTypes.map((type) => (
                        <th key={type} className="px-2 py-1">
                          {documentTypeLabel(type)}
                        </th>
                      ))}
                      <th className="px-2 py-1">Compliance</th>
                      <th className="px-2 py-1 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompliances.length === 0 && (
                      <tr>
                        <td
                          colSpan={2 + requiredTypes.length}
                          className="px-2 py-6 text-center text-xs text-slate-500"
                        >
                          Keine Fahrer für diese Filter.{" "}
                          <span className="text-slate-400">
                            (Hinweis: In v1 werden Dokumente als Mock-Daten
                            angezeigt.)
                          </span>
                        </td>
                      </tr>
                    )}

                    {filteredCompliances.map((row) => (
                      <tr
                        key={row.driverId}
                        className="rounded-xl bg-slate-50 hover:bg-slate-100"
                      >
                        <td className="px-2 py-2 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                              {row.driverInitials}
                            </div>
                            <div className="flex flex-col">
                              <a
                                href={`/hr/fahrer/${row.driverId}`}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                              >
                                {row.driverName}
                              </a>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 ${driverStatusClasses(
                                    row.driverStatus,
                                  )}`}
                                >
                                  {driverStatusLabel(row.driverStatus)}
                                </span>
                                {row.depotLabel && (
                                  <span>{row.depotLabel}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {requiredTypes.map((type) => {
                          const doc =
                            row.documents.find((d) => d.type === type) ?? null;
                          const status: DocumentStatus = doc?.status ?? "missing";
                          return (
                            <td
                              key={type}
                              className="px-2 py-2 align-middle"
                            >
                              <button
                                type="button"
                                onClick={() => openDrawer(row.driverId, type)}
                                className="flex w-full flex-col items-center rounded-xl border border-transparent px-1 py-1 text-[11px] hover:border-slate-200 hover:bg-white"
                              >
                                <span>{documentStatusIcon(status)}</span>
                                <span className="mt-0.5 text-[10px] text-slate-500">
                                  {status === "not_required"
                                    ? "—"
                                    : doc?.validUntil
                                    ? formatDate(doc.validUntil)
                                    : ""}
                                </span>
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 align-middle">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${overallComplianceClasses(
                              row.overallCompliance,
                            )}`}
                          >
                            {overallComplianceLabel(row.overallCompliance)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openDrawer(row.driverId, "license")
                            }
                            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:border-slate-300"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-1">Typ</th>
                      <th className="px-2 py-1">Fahrer</th>
                      <th className="px-2 py-1">Gültig bis</th>
                      <th className="px-2 py-1">Status</th>
                      <th className="px-2 py-1">Hochgeladen am</th>
                      <th className="px-2 py-1">Hochgeladen von</th>
                      <th className="px-2 py-1">Datei</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-2 py-6 text-center text-xs text-slate-500"
                        >
                          Keine Dateien für diese Filter.
                        </td>
                      </tr>
                    )}

                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="rounded-xl bg-slate-50 hover:bg-slate-100"
                      >
                        <td className="px-2 py-2 align-top">
                          <span className="text-xs text-slate-900">
                            {documentTypeLabel(file.type)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <a
                            href={`/hr/fahrer/${file.driverId}`}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            {file.driverName}
                          </a>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <span className="text-xs text-slate-900">
                            {formatDate(file.validUntil)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${documentStatusClasses(
                              file.status,
                            )}`}
                          >
                            {documentStatusLabel(file.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-slate-900">
                            {formatDate(file.uploadedAt)}
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <span className="text-xs text-slate-900">
                            {file.uploadedBy}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="flex flex-col gap-1 text-[11px]">
                            <span className="truncate text-slate-700">
                              {file.fileName}
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600 hover:border-slate-300"
                                onClick={() =>
                                  openDrawer(file.driverId, file.type)
                                }
                              >
                                Anzeigen
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Document detail drawer as card below */}
          {drawerState && selectedDriver && (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-slate-900">
                    Dokumentdetails – {selectedDriver.driverName}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    {documentTypeLabel(drawerState.type)} ·{" "}
                    {driverStatusLabel(selectedDriver.driverStatus)} ·{" "}
                    {selectedDriver.depotLabel ?? "Ohne Standort"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${overallComplianceClasses(
                      selectedDriver.overallCompliance,
                    )}`}
                  >
                    {overallComplianceLabel(selectedDriver.overallCompliance)}
                  </span>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Schließen
                  </button>
                </div>
              </div>

              {selectedDocument ? (
                <div className="mt-3 grid gap-4 md:grid-cols-3 text-xs text-slate-700">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">
                        Status
                      </div>
                      <div className="mt-1 space-y-1">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${documentStatusClasses(
                            selectedDocument.status,
                          )}`}
                        >
                          {documentStatusLabel(selectedDocument.status)}
                        </span>
                        {selectedDocument.status === "expired" && (
                          <div className="rounded-lg bg-red-50 px-2 py-1 text-[11px] text-red-700">
                            Fahrer ist aktuell gesperrt (Dokument abgelaufen).
                          </div>
                        )}
                        {selectedDocument.status === "missing" && (
                          <div className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                            Dokument fehlt – bitte Upload anstoßen.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2">
                      <div className="text-[11px] font-medium text-slate-500">
                        Gültigkeit
                      </div>
                      <div className="mt-1 space-y-1">
                        <div>
                          Gültig bis: {formatDate(selectedDocument.validUntil)}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-600">
                            Ablaufdatum setzen
                          </label>
                          <input
                            type="date"
                            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            onChange={(e) =>
                              setValidUntil(
                                selectedDriver.driverId,
                                drawerState.type,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">
                        Datei
                      </div>
                      <div className="mt-1 space-y-1">
                        <div>
                          Datei:{" "}
                          {selectedDocument.fileName ?? "Noch keine Datei"}
                        </div>
                        <div>
                          Hochgeladen:{" "}
                          {selectedDocument.uploadedAt
                            ? new Date(
                                selectedDocument.uploadedAt,
                              ).toLocaleString("de-DE")
                            : "—"}
                        </div>
                        <div>
                          Hochgeladen von:{" "}
                          {selectedDocument.uploadedBy ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2">
                      <div className="text-[11px] font-medium text-slate-500">
                        Aktionen
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:border-slate-300"
                        >
                          Dokument anzeigen
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700 hover:border-indigo-300"
                          onClick={() =>
                            simulateUploadNewVersion(
                              selectedDriver.driverId,
                              drawerState.type,
                              `${documentTypeLabel(
                                drawerState.type,
                              ).toLowerCase()}-neu.pdf`,
                            )
                          }
                        >
                          Neue Version hochladen (Mock)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">
                        Dokumentstatus anpassen
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-1 text-[11px]">
                        {(
                          [
                            "valid",
                            "expiring_soon",
                            "expired",
                            "missing",
                            "not_required",
                          ] as DocumentStatus[]
                        ).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              updateDocumentStatus(
                                selectedDriver.driverId,
                                drawerState.type,
                                s,
                              )
                            }
                            className={`rounded-full border px-2 py-1 ${
                              selectedDocument.status === s
                                ? documentStatusClasses(s)
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {documentStatusLabel(s)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2">
                      <div className="text-[11px] font-medium text-slate-500">
                        Hinweis zur Integration
                      </div>
                      <p className="mt-1 text-[11px] text-slate-700">
                        In späteren Versionen sperrt dieser Status Fahrer in
                        Schichten, blockiert Onboarding-Stufen und erzeugt
                        Warnungen im Gehaltsrechner.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-600">
                  Für diesen Fahrer und Dokumenttyp sind noch keine Details
                  hinterlegt. In v1 kannst du hier über „Neue Version hochladen
                  (Mock)" einen Datensatz simulieren.
                </div>
              )}
            </Card>
          )}
        </div>
      </PageState>
    </>
  );
}

