import Link from "next/link";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type { DriverDetail, DriverDocumentState } from "../_types";

type DriverDetailProps = {
  driver: DriverDetail;
};

function getStatusPillClasses(status: DriverDetail["status"]): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "onboarding":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "incomplete":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "blocked":
      return "bg-red-50 text-red-700 border-red-200";
    case "inactive":
      return "bg-slate-100 text-slate-600 border-slate-300";
  }
}

function getStatusPillLabel(status: DriverDetail["status"]): string {
  switch (status) {
    case "active":
      return "Aktiv";
    case "onboarding":
      return "Onboarding";
    case "incomplete":
      return "Unvollständig";
    case "blocked":
      return "Blockiert";
    case "inactive":
      return "Inaktiv / Archiviert";
  }
}

function getDeployabilityClasses(isDeployable: boolean): string {
  return isDeployable
    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
    : "bg-red-50 text-red-800 border-red-200";
}

function getDocStateIcon(state: DriverDocumentState): string {
  switch (state) {
    case "valid":
      return "✅";
    case "expiring":
      return "⚠️";
    case "missing":
      return "❌";
  }
}

export function DriverDetailView({ driver }: DriverDetailProps) {
  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title={driver.fullName}
        description={driver.subtitle}
        primaryAction={<Button>Bearbeiten</Button>}
        secondaryActions={
          <>
            <Button variant="secondary" size="sm">
              Sperren
            </Button>
            <Button variant="secondary" size="sm">
              Fahrzeug zuweisen
            </Button>
          </>
        }
      />

      <PageState status={status}>
        <div className="space-y-4">
          {/* Status row */}
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusPillClasses(
                  driver.status,
                )}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                <span>{getStatusPillLabel(driver.status)}</span>
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getDeployabilityClasses(
                  driver.isDeployable,
                )}`}
              >
                <span className="text-base">
                  {driver.isDeployable ? "✅" : "🔴"}
                </span>
                <span>{driver.deployabilityLabel}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{driver.locationLabel}</span>
              {driver.supervisorLabel && (
                <span className="hidden sm:inline">• {driver.supervisorLabel}</span>
              )}
            </div>
          </Card>

          {/* Main layout */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left column: profile & employment */}
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Stammdaten
                </h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-slate-600">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Name
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.fullName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Standort / Depot
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.locationLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Beschäftigungsart
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.employmentType === "vollzeit"
                        ? "Vollzeit"
                        : driver.employmentType === "teilzeit"
                        ? "Teilzeit"
                        : driver.employmentType === "minijob"
                        ? "Minijob"
                        : driver.employmentType === "werkstudent"
                        ? "Werkstudent"
                        : "Sonstiges"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Beschäftigung seit
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.employmentSinceLabel}
                    </div>
                  </div>
                  {driver.supervisorLabel && (
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Vorgesetzter / Disponent
                      </div>
                      <div className="mt-0.5 text-sm text-slate-900">
                        {driver.supervisorLabel}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Vergütung
                </h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-slate-600">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Basisvergütung
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.basePayLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Standard-Schichtlänge
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.shiftLengthLabel}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={driver.payDetailsLinkHref}>
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Im Gehaltsrechner öffnen
                    </button>
                  </Link>
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Fahrzeugzuweisung
                </h2>
                <div className="mt-3 text-sm text-slate-600">
                  {driver.vehicleLabel ? (
                    <>
                      <div className="text-sm text-slate-900">
                        {driver.vehicleLabel}
                      </div>
                      {driver.vehicleSecondaryLabel && (
                        <div className="mt-0.5 text-xs text-slate-500">
                          {driver.vehicleSecondaryLabel}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-slate-500">
                      Kein Fahrzeug zugewiesen.
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm">
                    Fahrzeug zuweisen
                  </Button>
                  <Link href="/fleet/fahrzeuge">
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Fleet / Fahrzeuge öffnen
                    </button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Right column: docs, contracts, time, notes */}
            <div className="space-y-4">
              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Dokumente &amp; Compliance
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Kritische Unterlagen für Einsatzfähigkeit und Versicherung.
                </p>
                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  {driver.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{getDocStateIcon(doc.state)}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-900">
                            {doc.label}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {doc.statusLabel}
                            {doc.expiryLabel ? ` · ${doc.expiryLabel}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm">Dokument hochladen</Button>
                  <Button variant="secondary" size="sm">
                    Dokument anfordern
                  </Button>
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Verträge
                </h2>
                <div className="mt-2 space-y-2 text-xs text-slate-700">
                  {driver.contracts.active ? (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <div className="text-xs font-medium text-slate-900">
                        Aktiver Vertrag: {driver.contracts.active.label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {driver.contracts.active.typeLabel} ·{" "}
                        {driver.contracts.active.startDateLabel}
                        {driver.contracts.active.endDateLabel
                          ? ` · ${driver.contracts.active.endDateLabel}`
                          : ""}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                      Kein aktiver Vertrag – prüfen.
                    </div>
                  )}

                  {driver.contracts.history.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Historie
                      </div>
                      <ul className="mt-1 space-y-1">
                        {driver.contracts.history.map((c) => (
                          <li
                            key={c.id}
                            className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600"
                          >
                            {c.label} · {c.typeLabel} · {c.startDateLabel}
                            {c.endDateLabel ? ` · ${c.endDateLabel}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <Link href="/hr/vertraege">
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Verträge öffnen
                    </button>
                  </Link>
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Einsätze &amp; Zeit
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Letzte Schicht
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.time.lastShiftLabel}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Stunden (7 Tage)
                      </div>
                      <div className="mt-0.5 text-sm text-slate-900">
                        {driver.time.hoursLast7Days} h
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Stunden (30 Tage)
                      </div>
                      <div className="mt-0.5 text-sm text-slate-900">
                        {driver.time.hoursLast30Days} h
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link href="/hr/zeiterfassung">
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Alle Zeiterfassungen anzeigen
                    </button>
                  </Link>
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Abwesenheiten
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Nächster Urlaub
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.absences.nextVacationLabel ?? "Kein Urlaub geplant"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Offene Krankentage
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {driver.absences.openSickDaysLabel ?? "Keine offenen Krankentage"}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link href="/hr/urlaub">
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Abwesenheiten verwalten
                    </button>
                  </Link>
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Notizen (intern)
                </h2>
                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  {driver.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="text-[11px] font-medium text-slate-500">
                        {note.dateLabel}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-800">
                        {note.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <textarea
                    rows={3}
                    placeholder="Notiz hinzufügen (Speichern folgt in einer späteren Version)…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </PageState>
    </>
  );
}

