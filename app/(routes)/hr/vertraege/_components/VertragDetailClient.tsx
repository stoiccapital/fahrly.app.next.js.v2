"use client";

import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type { Contract } from "@/app/(routes)/hr/_types";

type VertragDetailClientProps = {
  contract: Contract;
};

function contractStatusLabel(status: Contract["status"]): string {
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

function contractStatusClasses(status: Contract["status"]): string {
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

function contractTypeLabel(type: Contract["type"]): string {
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

function dateLabel(dateString?: string): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function VertragDetailClient({ contract }: VertragDetailClientProps) {
  const status: "ready" = "ready";

  const subtitleParts: string[] = [];
  subtitleParts.push(contractTypeLabel(contract.type));
  if (contract.location) subtitleParts.push(contract.location);

  return (
    <>
      <PageHeader
        title={`Vertrag – ${contract.driverName}`}
        description={subtitleParts.join(" · ") || undefined}
        primaryAction={
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm">
              Bearbeiten (Mock)
            </Button>
            <Button type="button" variant="secondary" size="sm">
              Beenden (Mock)
            </Button>
          </div>
        }
        secondaryActions={
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${contractStatusClasses(
              contract.status,
            )}`}
          >
            {contractStatusLabel(contract.status)}
          </span>
        }
      />

      <PageState status={status}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left column: Stammdaten & Laufzeit & Dokument */}
          <div className="space-y-4">
            <Card>
              <div className="text-xs font-medium text-slate-500">
                Vertragsdaten
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <div>
                  Fahrer:{" "}
                  <a
                    href={`/hr/fahrer/${contract.driverId}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    {contract.driverName}
                  </a>
                </div>
                <div>Vertragsart: {contractTypeLabel(contract.type)}</div>
                {contract.roleTitle && (
                  <div>Rolle / Jobtitel: {contract.roleTitle}</div>
                )}
                {contract.location && (
                  <div>Standort / Einsatzort: {contract.location}</div>
                )}
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-slate-500">
                Laufzeit &amp; Status
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <div>Beginn: {dateLabel(contract.startDate)}</div>
                <div>
                  Ende: {contract.endDate ? dateLabel(contract.endDate) : "unbefristet"}
                </div>
                {contract.probationMonths && (
                  <div>Probezeit: {contract.probationMonths} Monate</div>
                )}
                {contract.terminationNotice && (
                  <div>Kündigungsfrist: {contract.terminationNotice}</div>
                )}
                <div className="pt-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${contractStatusClasses(
                      contract.status,
                    )}`}
                  >
                    {contractStatusLabel(contract.status)}
                  </span>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                Historie (Mock): Später können hier Ereignisse wie
                „Unterschrieben", „Probezeit beendet" und „Beendet"
                zeitgestempelt dargestellt werden.
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-slate-500">
                Dokument(e)
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                {contract.mainDocumentId ? (
                  <>
                    <div>Hauptdokument: Arbeitsvertrag (PDF, Mock)</div>
                    <div>
                      Verknüpftes Dokument:{" "}
                      <span className="font-mono text-[11px]">
                        {contract.mainDocumentId}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/hr/dokumente?driverId=${contract.driverId}`;
                        }}
                      >
                        In Dokumente öffnen
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                      >
                        Neue Version hochladen (Mock)
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      Kein unterschriebener Vertrag verknüpft. In v2 wird hier
                      das PDF aus „Dokumente" angezeigt.
                    </div>
                    <div className="mt-1 text-[11px] text-amber-700">
                      Hinweis: Ohne gültigen Vertrags-Upload sollte der Fahrer
                      nicht als vollständig einsatzbereit gelten.
                    </div>
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/hr/dokumente?driverId=${contract.driverId}`;
                        }}
                      >
                        Dokument in Dokumente anlegen (Mock)
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Right column: Vergütung, Arbeitszeit, Notizen */}
          <div className="space-y-4">
            <Card>
              <div className="text-xs font-medium text-slate-500">
                Vergütung
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <div>
                  Modell: <span className="font-medium">{basePayLabel(contract)}</span>
                </div>
                {contract.basePayType === "hourly" && (
                  <div>Basis: Stundenlohn</div>
                )}
                {contract.basePayType === "monthly" && (
                  <div>Basis: Monatsgehalt</div>
                )}
                {contract.basePayType === "daily" && (
                  <div>Basis: Tagessatz</div>
                )}
                {contract.basePayType === "per_ride" && (
                  <div>Basis: Vergütung pro Tour</div>
                )}

                {(contract.nightBonusPercent ||
                  contract.weekendBonusPercent ||
                  contract.holidayBonusPercent) && (
                  <div className="mt-2">
                    <div className="text-[11px] font-medium text-slate-500">
                      Zuschläge (Mock)
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {contract.nightBonusPercent && (
                        <li>Nachtzuschlag: {contract.nightBonusPercent}%</li>
                      )}
                      {contract.weekendBonusPercent && (
                        <li>
                          Wochenendzuschlag: {contract.weekendBonusPercent}%
                        </li>
                      )}
                      {contract.holidayBonusPercent && (
                        <li>
                          Feiertagszuschlag: {contract.holidayBonusPercent}%
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                Gehaltsrechner nutzt diese Informationen als Basis für
                Auszahlungen. In v2 werden hier konkrete Berechnungsparameter
                verknüpft.
              </div>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    window.location.href = `/hr/gehaltsrechner?driverId=${contract.driverId}`;
                  }}
                >
                  Im Gehaltsrechner anzeigen (Mock)
                </Button>
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-slate-500">
                Arbeitszeit &amp; Einsatz
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <div>
                  Regelarbeitszeit:{" "}
                  {contract.expectedWeeklyHours
                    ? `${contract.expectedWeeklyHours} h/Woche`
                    : "Nicht hinterlegt (Mock)"}
                </div>
                {contract.shiftTypes && contract.shiftTypes.length > 0 && (
                  <div>
                    Schichtarten:{" "}
                    {contract.shiftTypes
                      .map((t) =>
                        t === "day"
                          ? "Tag"
                          : t === "night"
                          ? "Nacht"
                          : "Wochenende",
                      )
                      .join(", ")}
                  </div>
                )}
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                Später können hier geplante Schichtvolumina und tatsächliche
                Einsatzdaten gegenübergestellt werden.
              </div>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    window.location.href = `/hr/schichten?driverId=${contract.driverId}`;
                  }}
                >
                  Schichten öffnen (Mock)
                </Button>
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-slate-500">
                Besonderheiten &amp; Notizen
              </div>
              <div className="mt-2 text-xs text-slate-700">
                {contract.notes ?? "Keine besonderen Vereinbarungen hinterlegt."}
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                In v2 kann hier ein freies Notizfeld sowie strukturierte
                Klausellisten (z.B. Eigene Fahrzeugnutzung, Bonusregeln) gepflegt
                werden.
              </div>
            </Card>
          </div>
        </div>
      </PageState>
    </>
  );
}

