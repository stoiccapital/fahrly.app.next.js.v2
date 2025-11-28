import Link from "next/link";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  OnboardingDetail,
  OnboardingChecklistItem,
  OnboardingDocumentSummary,
} from "@/app/(routes)/hr/_types";

type OnboardingDetailViewProps = {
  onboarding: OnboardingDetail;
};

function getChecklistStatusLabel(
  status: OnboardingChecklistItem["status"],
): string {
  switch (status) {
    case "open":
      return "Offen";
    case "in_progress":
      return "In Arbeit";
    case "done":
      return "Fertig";
  }
}

function getChecklistStatusClasses(
  status: OnboardingChecklistItem["status"],
): string {
  switch (status) {
    case "open":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "in_progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "done":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
}

function getDocIcon(state: OnboardingDocumentSummary["state"]): string {
  switch (state) {
    case "valid":
      return "✅";
    case "expiring":
      return "⚠️";
    case "missing":
      return "❌";
  }
}

export function OnboardingDetailView({ onboarding }: OnboardingDetailViewProps) {
  const status: "ready" = "ready";
  const progressPercent =
    onboarding.checklistTotalCount === 0
      ? 0
      : Math.round(
          (onboarding.checklistCompletedCount / onboarding.checklistTotalCount) * 100,
        );

  const hasCriticalMissing = onboarding.criticalMissingCount > 0 || !onboarding.isReady;

  return (
    <>
      <PageHeader
        title={onboarding.driverName}
        description={onboarding.stageLabel}
        primaryAction={
          onboarding.isReady ? (
            <Button>Als Fahrer anlegen</Button>
          ) : (
            <Button disabled>Als Fahrer anlegen</Button>
          )
        }
        secondaryActions={
          <>
            <Button variant="secondary" size="sm">
              Stage ändern
            </Button>
            <Button variant="secondary" size="sm">
              Onboarding abbrechen
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
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  onboarding.isReady
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                <span className="text-base">
                  {onboarding.isReady ? "✅" : "🔴"}
                </span>
                <span>{onboarding.readinessLabel}</span>
              </span>
              {onboarding.targetStartDateLabel && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {onboarding.targetStartDateLabel}
                </span>
              )}
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left: Person & meta */}
            <div className="space-y-4 lg:col-span-1">
              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Kandidat / Personendaten
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Name
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {onboarding.driverName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Kontakt
                    </div>
                    <div className="mt-0.5 flex flex-col gap-1 text-sm text-slate-900">
                      <span>{onboarding.phone}</span>
                      {onboarding.email && (
                        <span className="text-xs text-slate-600">
                          {onboarding.email}
                        </span>
                      )}
                    </div>
                  </div>
                  {onboarding.preferredLanguage && (
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Bevorzugte Sprache
                      </div>
                      <div className="mt-0.5 text-sm text-slate-900">
                        {onboarding.preferredLanguage}
                      </div>
                    </div>
                  )}
                  {onboarding.location && (
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Standort / Depot
                      </div>
                      <div className="mt-0.5 text-sm text-slate-900">
                        {onboarding.location}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Rolle &amp; Konditionen
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Beschäftigungsart
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {onboarding.employmentType === "vollzeit"
                        ? "Vollzeit"
                        : onboarding.employmentType === "teilzeit"
                        ? "Teilzeit"
                        : onboarding.employmentType === "minijob"
                        ? "Minijob"
                        : onboarding.employmentType === "werkstudent"
                        ? "Werkstudent"
                        : "Sonstiges"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Geplante Schichten
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1 text-xs text-slate-900">
                      {onboarding.shiftTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                      {onboarding.shiftTags.length === 0 && (
                        <span className="text-slate-500">
                          Noch keine Schichtpräferenz hinterlegt.
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Basisvergütung
                    </div>
                    <div className="mt-0.5 text-sm text-slate-900">
                      {onboarding.basePayLabel}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Geplanter Start
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {onboarding.desiredStartDateLabel && (
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Wunsch-Startdatum
                      </div>
                      <div className="mt-0.5 text-sm text-slate-900">
                        {onboarding.desiredStartDateLabel}
                      </div>
                    </div>
                  )}
                  {onboarding.actualStartDateLabel && (
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Tatsächlicher Start
                      </div>
                      <div className="mt-0.5 text-sm text-slate-900">
                        {onboarding.actualStartDateLabel}
                      </div>
                    </div>
                  )}
                  {onboarding.noteSummary && (
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Notizen
                      </div>
                      <div className="mt-0.5 text-xs text-slate-800">
                        {onboarding.noteSummary}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Verknüpfung zu Fahrer
                </h2>
                <div className="mt-3 text-sm text-slate-600">
                  {onboarding.linkedDriverId && onboarding.linkedDriverName ? (
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-slate-500">
                        Verknüpfter Fahrer
                      </div>
                      <Link
                        href={`/hr/fahrer/${onboarding.linkedDriverId}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {onboarding.linkedDriverName}
                      </Link>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Noch kein Fahrer-Datensatz erstellt.
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" disabled={!onboarding.isReady}>
                    Fahrer erstellen &amp; Onboarding abschließen
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right: Checklist, docs, communication */}
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Onboarding-Checklist
                </h2>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    {onboarding.checklistCompletedCount}/
                    {onboarding.checklistTotalCount} Schritte abgeschlossen
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  {onboarding.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          disabled
                          checked={item.status === "done"}
                          className="mt-0.5 h-3 w-3 rounded border-slate-300 text-indigo-600"
                          readOnly
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-900">
                            {item.label}
                            {item.required && (
                              <span className="ml-1 text-[10px] text-red-500">
                                *
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`ml-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${getChecklistStatusClasses(
                          item.status,
                        )}`}
                      >
                        {getChecklistStatusLabel(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Dokumente-Status
                </h2>
                <div className="mt-1 text-xs text-slate-600">
                  <p>
                    Kurzübersicht der wichtigsten Dokumente. Vollständige
                    Verwaltung erfolgt unter HR / Dokumente.
                  </p>
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  {onboarding.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{getDocIcon(doc.state)}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-900">
                            {doc.label}
                          </span>
                          {doc.detailLabel && (
                            <span className="text-[11px] text-slate-500">
                              {doc.detailLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {hasCriticalMissing && (
                  <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11px] text-red-700">
                    Fahrer kann noch nicht eingesetzt werden –{" "}
                    {onboarding.criticalMissingCount > 0
                      ? `${onboarding.criticalMissingCount} Dokument(e) fehlen.`
                      : "kritische Schritte im Onboarding offen."}
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="text-sm font-medium text-slate-900">
                  Kommunikation &amp; Notizen
                </h2>
                <div className="mt-3 space-y-2 text-xs text-slate-700">
                  {onboarding.notes.length === 0 && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                      Bisher keine Notizen hinterlegt.
                    </div>
                  )}
                  {onboarding.notes.map((note) => (
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

