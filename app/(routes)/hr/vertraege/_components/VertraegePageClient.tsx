"use client";

import { useMemo, useState } from "react";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  BasePayType,
  Contract,
  ContractKpis,
  ContractStatus,
  ContractType,
} from "@/app/(routes)/hr/_types";

type VertraegePageClientProps = {
  contractsFromServer: Contract[];
  kpisFromServer: ContractKpis;
};

type FiltersState = {
  search: string;
  status: ContractStatus | "all";
  type: ContractType | "all";
};

function contractStatusLabel(status: ContractStatus): string {
  switch (status) {
    case "draft":
      return "Entwurf";
    case "sent":
      return "Gesendet";
    case "signed":
      return "Unterschrieben";
    case "active":
      return "Aktiv";
    case "ended":
      return "Beendet";
    case "rejected":
      return "Abgelehnt";
  }
}

function contractStatusClasses(status: ContractStatus): string {
  switch (status) {
    case "draft":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "sent":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "signed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ended":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function contractTypeLabel(type: ContractType): string {
  switch (type) {
    case "full_time":
      return "Vollzeit";
    case "part_time":
      return "Teilzeit";
    case "mini_job":
      return "Minijob";
    case "contractor":
      return "Freelancer";
  }
}

function basePayLabel(contract: Contract): string {
  const amount = contract.basePayAmount.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  switch (contract.basePayType) {
    case "hourly":
      return `${amount} €/h`;
    case "monthly":
      return `${amount} €/Monat`;
    case "daily":
      return `${amount} €/Tag`;
    case "per_ride":
      return `${amount} €/Tour`;
    default:
      return `${amount}`;
  }
}

function dateRangeLabel(start: string, end?: string): string {
  const s = new Date(start);
  const f = (d: Date) =>
    d.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  if (!end) return `${f(s)} – unbefristet`;
  const e = new Date(end);
  return `${f(s)} – ${f(e)}`;
}

function endBadgeLabel(contract: Contract): string | null {
  if (!contract.endDate) return null;
  const end = new Date(contract.endDate);
  const today = new Date();

  const diffMs = end.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Abgelaufen";
  if (diffDays <= 30) return `Läuft in ${diffDays} Tagen aus`;
  return null;
}

function endBadgeClasses(label: string | null): string {
  if (!label) return "";
  if (label === "Abgelaufen") {
    return "bg-red-50 text-red-700 border-red-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function documentIcon(hasDoc: boolean): string {
  return hasDoc ? "✅" : "🔴";
}

function documentLabel(hasDoc: boolean): string {
  return hasDoc ? "PDF vorhanden" : "Fehlt";
}

export function VertraegePageClient({
  contractsFromServer,
  kpisFromServer,
}: VertraegePageClientProps) {
  const [contracts, setContracts] = useState<Contract[]>(contractsFromServer);
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    status: "all",
    type: "all",
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !c.driverName.toLowerCase().includes(q) &&
          !c.roleTitle?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (filters.status !== "all" && c.status !== filters.status) {
        return false;
      }

      if (filters.type !== "all" && c.type !== filters.type) {
        return false;
      }

      return true;
    });
  }, [contracts, filters]);

  function openCreateModal() {
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
  }

  function handleCreateSubmit(formData: FormData) {
    const driverName = (formData.get("driverName") as string) || "";
    const driverInitials = (formData.get("driverInitials") as string) || "??";
    const contractType = formData.get("contractType") as ContractType | null;
    const basePayType = formData.get("basePayType") as BasePayType | null;
    const basePayAmountStr =
      (formData.get("basePayAmount") as string) || "0";
    const startDate = (formData.get("startDate") as string) || "";

    if (!driverName || !contractType || !basePayType || !startDate) {
      closeCreateModal();
      return;
    }

    const basePayAmount = parseFloat(basePayAmountStr.replace(",", ".") || "0");

    const newContract: Contract = {
      id: `contract-draft-${Date.now()}`,
      driverId: `driver-manual-${Date.now()}`,
      driverName,
      driverInitials,
      driverStatus: "onboarding",
      type: contractType,
      status: "draft",
      startDate,
      endDate: undefined,
      probationMonths: 6,
      terminationNotice: "4 Wochen zum Monatsende",
      basePayType,
      basePayAmount: isNaN(basePayAmount) ? 0 : basePayAmount,
      nightBonusPercent: undefined,
      weekendBonusPercent: undefined,
      holidayBonusPercent: undefined,
      location: "Berlin",
      roleTitle: "Fahrer",
      expectedWeeklyHours: undefined,
      shiftTypes: ["day"],
      mainDocumentId: undefined,
      notes: "Manuell angelegter Vertragsentwurf (Mock).",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContracts((prev) => [newContract, ...prev]);
    closeCreateModal();
  }

  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="Verträge"
        description="Arbeitsverträge, Status und Laufzeiten im Blick."
        primaryAction={
          <Button type="button" onClick={openCreateModal}>
            + Vertrag anlegen
          </Button>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* KPI row */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-default">
              <div className="text-xs font-medium text-slate-500">
                Aktive Verträge
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {kpisFromServer.activeContracts}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Laufende Arbeitsverhältnisse.
              </div>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "active",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Verträge laufen in 30 Tagen aus
              </div>
              <div className="mt-1 text-xl font-semibold text-amber-600">
                {kpisFromServer.expiringIn30Days}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Proaktiv verlängern oder beenden.
              </div>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "sent",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Offene Vertragsunterschriften
              </div>
              <div className="mt-1 text-xl font-semibold text-sky-600">
                {kpisFromServer.pendingSignatures}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Entwürfe & gesendete Verträge ohne Unterschrift.
              </div>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: "ended",
                }))
              }
            >
              <div className="text-xs font-medium text-slate-500">
                Beendete Verträge (90 Tage)
              </div>
              <div className="mt-1 text-xl font-semibold text-slate-900">
                {kpisFromServer.endedLast90Days}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Für Auswertungen & Reporting.
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Fahrer / Rolle
                </label>
                <input
                  type="text"
                  placeholder="Name oder Rolle…"
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
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: (e.target.value as ContractStatus | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="draft">Entwurf</option>
                  <option value="sent">Gesendet</option>
                  <option value="signed">Unterschrieben</option>
                  <option value="active">Aktiv</option>
                  <option value="ended">Beendet</option>
                  <option value="rejected">Abgelehnt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Vertragsart
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: (e.target.value as ContractType | "all") || "all",
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">Alle</option>
                  <option value="full_time">Vollzeit</option>
                  <option value="part_time">Teilzeit</option>
                  <option value="mini_job">Minijob</option>
                  <option value="contractor">Freelancer</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1 text-left text-xs">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-1">Fahrer</th>
                    <th className="px-2 py-1">Vertragsart</th>
                    <th className="px-2 py-1">Laufzeit</th>
                    <th className="px-2 py-1">Vergütung</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Dokument</th>
                    <th className="px-2 py-1 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-2 py-6 text-center text-xs text-slate-500"
                      >
                        Keine Verträge für diese Filter.
                      </td>
                    </tr>
                  )}

                  {filteredContracts.map((contract) => {
                    const endLabel = endBadgeLabel(contract);
                    const hasDoc = Boolean(contract.mainDocumentId);

                    return (
                      <tr
                        key={contract.id}
                        className="cursor-pointer rounded-xl bg-slate-50 hover:bg-slate-100"
                        onClick={() => {
                          window.location.href = `/hr/vertraege/${contract.id}`;
                        }}
                      >
                        <td className="px-2 py-2 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                              {contract.driverInitials}
                            </div>
                            <div className="flex flex-col">
                              <a
                                href={`/hr/fahrer/${contract.driverId}`}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {contract.driverName}
                              </a>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                                {contract.roleTitle && (
                                  <span>{contract.roleTitle}</span>
                                )}
                                {contract.location && (
                                  <span>· {contract.location}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <span className="text-xs text-slate-900">
                            {contractTypeLabel(contract.type)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-slate-900">
                            {dateRangeLabel(contract.startDate, contract.endDate)}
                          </div>
                          {endLabel && (
                            <div
                              className={`mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${endBadgeClasses(
                                endLabel,
                              )}`}
                            >
                              {endLabel}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="text-xs text-slate-900">
                            {basePayLabel(contract)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            {contract.basePayType === "monthly"
                              ? "Basis Monatsgehalt"
                              : contract.basePayType === "hourly"
                              ? "Stundenlohn"
                              : contract.basePayType === "daily"
                              ? "Tagessatz"
                              : "Pro Tour"}
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${contractStatusClasses(
                              contract.status,
                            )}`}
                          >
                            {contractStatusLabel(contract.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="flex flex-col text-[11px] text-slate-700">
                            <span>
                              {documentIcon(hasDoc)} {documentLabel(hasDoc)}
                            </span>
                            {hasDoc && (
                              <button
                                type="button"
                                className="mt-0.5 text-[11px] text-indigo-600 hover:text-indigo-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/hr/dokumente?driverId=${contract.driverId}`;
                                }}
                              >
                                In Dokumente öffnen
                              </button>
                            )}
                          </div>
                        </td>
                        <td
                          className="px-2 py-2 align-top text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:border-slate-300"
                            onClick={() =>
                              (window.location.href = `/hr/vertraege/${contract.id}`)
                            }
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Create modal (simple draft creator) */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40">
              <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-900">
                    Vertrag anlegen
                  </h2>
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Schließen
                  </button>
                </div>
                <form
                  className="mt-3 space-y-3 text-xs"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleCreateSubmit(formData);
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Fahrername
                      </label>
                      <input
                        type="text"
                        name="driverName"
                        placeholder="Max Schneider"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Initialen
                      </label>
                      <input
                        type="text"
                        name="driverInitials"
                        placeholder="MS"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Vertragsart
                      </label>
                      <select
                        name="contractType"
                        defaultValue="full_time"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      >
                        <option value="full_time">Vollzeit</option>
                        <option value="part_time">Teilzeit</option>
                        <option value="mini_job">Minijob</option>
                        <option value="contractor">Freelancer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Vergütungsart
                      </label>
                      <select
                        name="basePayType"
                        defaultValue="hourly"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      >
                        <option value="hourly">Stundenlohn</option>
                        <option value="monthly">Monatsgehalt</option>
                        <option value="daily">Tagessatz</option>
                        <option value="per_ride">Pro Tour</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Vergütung (Betrag)
                      </label>
                      <input
                        type="text"
                        name="basePayAmount"
                        placeholder="15"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Startdatum
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                    Der Vertrag wird als <strong>Entwurf</strong> angelegt.
                    Später kann er im Detailbildschirm auf „Gesendet",
                    „Unterschrieben" oder „Aktiv" gesetzt werden. In v2 folgt
                    E-Sign & Template-Logik.
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full">
                      Vertrag anlegen (Entwurf)
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </PageState>
    </>
  );
}

