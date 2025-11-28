"use client";

import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import type {
  DriverPerformance,
  PerformancePeriod,
} from "@/app/(routes)/hr/_types";

type LeistungsuebersichtDriverDetailClientProps = {
  performance: DriverPerformance;
  period: PerformancePeriod;
};

function percentLabel(value: number): string {
  return `${Math.round(value * 100)} %`;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-700";
  if (score >= 70) return "text-sky-700";
  if (score >= 60) return "text-amber-700";
  return "text-red-700";
}

export function LeistungsuebersichtDriverDetailClient({
  performance,
  period,
}: LeistungsuebersichtDriverDetailClientProps) {
  const status: "ready" = "ready";

  const headlineTags: string[] = [];
  if (performance.onTimeRate >= 0.95) headlineTags.push("Sehr zuverlässig");
  if (performance.complaints === 0) headlineTags.push("Keine Beschwerden");
  if (performance.noShows === 0) headlineTags.push("Keine No-Shows");
  if (performance.hours >= 160) headlineTags.push("Hohe Einsatzzeit");

  return (
    <>
      <PageHeader
        title={performance.driverName}
        description={`${period.label} · Leistungsübersicht`}
        primaryAction={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                window.location.href = `/hr/fahrer/${performance.driverId}`;
              }}
            >
              Fahrerprofil öffnen
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                window.location.href = `/hr/schichten?driverId=${performance.driverId}`;
              }}
            >
              Schichten anzeigen
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                window.location.href = `/hr/gehaltsrechner?driverId=${performance.driverId}`;
              }}
            >
              Gehaltsrechner
            </Button>
          </div>
        }
        secondaryActions={
          <div className="flex flex-col items-end gap-1">
            <div className={`text-lg font-semibold ${scoreColor(performance.score)}`}>
              Performance-Score: {performance.score} / 100
            </div>
            {headlineTags.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1">
                {headlineTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        }
      />

      <PageState status={status}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left column: Einsatz & Zuverlässigkeit */}
          <div className="space-y-4">
            <Card>
              <div className="text-xs font-medium text-slate-500">
                Einsatz &amp; Volumen
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div>
                  <div className="text-[11px] text-slate-500">
                    Stunden im Zeitraum
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {performance.hours.toFixed(1)} h
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    Schichten
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {performance.shifts}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    Ø Stunden/Schicht
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {(performance.hours / Math.max(performance.shifts, 1)).toFixed(1)} h
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    Standort
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {performance.location ?? "—"}
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                Später kann hier ein kleines Verlaufschart (Stunden pro Tag /
                Woche) eingebunden werden. Für v1 reichen aggregierte Kennzahlen.
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-slate-500">
                Zuverlässigkeit
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div>
                  <div className="text-[11px] text-slate-500">
                    Pünktlich gestartete Schichten
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {percentLabel(performance.onTimeRate)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    Verspätete Schichten
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {performance.lateShifts}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    No-Shows
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {performance.noShows}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    Beschwerden
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {performance.complaints}
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                In v2 können hier Trends gegenüber dem Vormonat und Ursachen
                (z.B. Tour-Typ, Wetter, Strecke) visualisiert werden.
              </div>
            </Card>
          </div>

          {/* Right column: Compliance, Finanzen, Notizen */}
          <div className="space-y-4">
            <Card>
              <div className="text-xs font-medium text-slate-500">
                Compliance &amp; Verhalten
              </div>
              <div className="mt-2 text-xs text-slate-700">
                {performance.complianceIssues === 0 ? (
                  <div className="text-emerald-700">
                    Dokumente & Verhalten: Keine Auffälligkeiten (Mock).
                  </div>
                ) : (
                  <div className="text-amber-700">
                    {performance.complianceIssues} Compliance-Issue(s) im
                    Zeitraum (Mock).
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    window.location.href = `/hr/dokumente?driverId=${performance.driverId}`;
                  }}
                >
                  Dokumente & Compliance öffnen
                </Button>
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                Später können hier konkrete Vorfälle aus Schäden & Unfällen
                (Fleet) sowie Abmahnungen angezeigt werden.
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-slate-500">
                Finanzieller Beitrag (Mock)
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div>
                  <div className="text-[11px] text-slate-500">
                    Umsatz (geschätzt)
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {performance.revenue != null
                      ? `${performance.revenue.toLocaleString("de-DE")} €`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">
                    Lohnkosten (brutto)
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {performance.wageCost != null
                      ? `${performance.wageCost.toLocaleString("de-DE")} €`
                      : "—"}
                  </div>
                </div>
                {performance.revenue != null &&
                  performance.wageCost != null && (
                    <div className="col-span-2">
                      <div className="text-[11px] text-slate-500">
                        Verhältnis Umsatz / Lohnkosten
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-900">
                        {(
                          performance.revenue / performance.wageCost
                        ).toFixed(2)}{" "}
                        ×
                      </div>
                    </div>
                  )}
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                Gehaltsrechner liefert später echte Beträge aus Zeit- und
                Schichtdaten. Hier entsteht das „Money Software"-Gefühl.
              </div>
            </Card>

            <Card>
              <div className="text-xs font-medium text-slate-500">
                Notizen &amp; Maßnahmen
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                {performance.notes && performance.notes.length > 0 ? (
                  performance.notes.map((note, idx) => (
                    <div
                      key={`${performance.driverId}-note-${idx}`}
                      className="rounded-lg bg-slate-50 px-2 py-1"
                    >
                      {note}
                    </div>
                  ))
                ) : (
                  <div>Keine Notizen hinterlegt.</div>
                )}
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                In v2 kann hier eine echte Historie mit Datum, Autor und
                Maßnahmen (z.B. Coaching, Lob, Einschränkungen) aufgebaut
                werden.
              </div>
              <div className="mt-2">
                <Button type="button" variant="secondary" size="sm">
                  Notiz hinzufügen (Mock)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageState>
    </>
  );
}

