import Link from "next/link";
import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button, Card } from "@/app/components/shared/ui";
import { getMockOnboardingCases } from "@/app/(routes)/hr/onboarding/_data/mockOnboarding";
import type {
  OnboardingCase,
  OnboardingStage,
} from "@/app/(routes)/hr/_types";

type OnboardingBoardProps = {
  searchQuery?: string;
  stageFilter?: OnboardingStage | "all";
  locationFilter?: string;
  responsibleFilter?: string;
};

type StageConfig = {
  id: OnboardingStage;
  label: string;
  description: string;
};

const STAGES: StageConfig[] = [
  {
    id: "lead",
    label: "Lead / Bewerber",
    description: "Interessiert, noch nicht geprüft.",
  },
  {
    id: "docs_pending",
    label: "Dokumente offen",
    description: "Wichtige Unterlagen fehlen noch.",
  },
  {
    id: "contract_pending",
    label: "Vertrag offen",
    description: "Vertrag versendet, noch nicht unterschrieben.",
  },
  {
    id: "training",
    label: "Schulung / Einweisung",
    description: "Training, Probefahrt, Einweisung.",
  },
  {
    id: "start_scheduled",
    label: "Start geplant",
    description: "Startdatum steht fest.",
  },
  {
    id: "completed",
    label: "Abgeschlossen",
    description: "Onboarding abgeschlossen.",
  },
];

function filterCases(
  cases: OnboardingCase[],
  { searchQuery, stageFilter, locationFilter, responsibleFilter }: OnboardingBoardProps,
): OnboardingCase[] {
  let result = cases;

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter((c) => {
      return (
        c.driverName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }

  if (stageFilter && stageFilter !== "all") {
    result = result.filter((c) => c.stage === stageFilter);
  }

  if (locationFilter && locationFilter.trim()) {
    const loc = locationFilter.toLowerCase();
    result = result.filter((c) =>
      c.location ? c.location.toLowerCase().includes(loc) : false,
    );
  }

  if (responsibleFilter && responsibleFilter.trim()) {
    const resp = responsibleFilter.toLowerCase();
    result = result.filter((c) =>
      c.responsible ? c.responsible.toLowerCase().includes(resp) : false,
    );
  }

  return result;
}

function getStageCases(
  cases: OnboardingCase[],
  stage: OnboardingStage,
): OnboardingCase[] {
  return cases.filter((c) => c.stage === stage);
}

export function OnboardingBoard(props: OnboardingBoardProps) {
  const allCases = getMockOnboardingCases();
  const filteredCases = filterCases(allCases, props);

  const status: "ready" | "empty" =
    allCases.length === 0 ? "empty" : filteredCases.length === 0 ? "empty" : "ready";

  if (status === "empty") {
    return (
      <>
        <PageHeader
          title="Onboarding"
          description="Pipeline, um neue Fahrer von Lead bis Einsatzbereit zu bringen."
          primaryAction={<Button>Onboarding starten</Button>}
          secondaryActions={
            <Link href="/hr/fahrer">
              <Button variant="secondary" size="sm">
                Zur Fahrerübersicht
              </Button>
            </Link>
          }
        />
        <PageState
          status="empty"
          emptyTitle={
            allCases.length === 0
              ? "Noch keine Onboardings gestartet"
              : "Keine Onboarding-Fälle mit diesen Filtern gefunden"
          }
          emptyDescription={
            allCases.length === 0
              ? "Starten Sie den ersten Onboarding-Fall, um neue Fahrer strukturiert zu aktivieren."
              : "Passen Sie die Filter an oder setzen Sie sie zurück."
          }
          emptyAction={
            allCases.length === 0 ? (
              <Button>Onboarding starten</Button>
            ) : (
              <Link href="/hr/onboarding">
                <Button variant="secondary">Filter zurücksetzen</Button>
              </Link>
            )
          }
        >
          {null}
        </PageState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Onboarding"
        description="Mini-Pipeline vom Bewerber bis zum einsatzbereiten Fahrer."
        primaryAction={<Button>Onboarding starten</Button>}
        secondaryActions={
          <Link href="/hr/fahrer">
            <Button variant="secondary" size="sm">
              Zur Fahrerübersicht
            </Button>
          </Link>
        }
      />

      <PageState status="ready">
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <form className="grid gap-3 md:grid-cols-4 md:items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Suche
                </label>
                <input
                  type="text"
                  name="q"
                  defaultValue={props.searchQuery ?? ""}
                  placeholder="Name, Telefon, E-Mail"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Standort
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={props.locationFilter ?? ""}
                  placeholder="z.B. Berlin"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Verantwortlich
                </label>
                <input
                  type="text"
                  name="responsible"
                  defaultValue={props.responsibleFilter ?? ""}
                  placeholder="z.B. Sarah"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </form>
          </Card>

          {/* Vertical 6-step pipeline */}
          <div className="space-y-4">
            {STAGES.map((stage, index) => {
              const stageCases = getStageCases(filteredCases, stage.id);

              const isLast = index === STAGES.length - 1;

              const stepNumber = index + 1;

              return (
                <div key={stage.id} className="flex gap-3">
                  {/* Step indicator column */}
                  <div className="flex flex-col items-center pt-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                      {stepNumber}
                    </div>
                    {!isLast && (
                      <div className="mt-1 h-full w-px bg-slate-200" />
                    )}
                  </div>

                  {/* Stage content */}
                  <Card className="flex-1">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-700">
                          {stage.label}
                        </h2>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {stage.description}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] text-slate-600">
                        {stageCases.length} Kandidat
                        {stageCases.length === 1 ? "" : "en"}
                      </span>
                    </div>

                    <div className="mt-2 space-y-2">
                      {stageCases.map((onb) => {
                        const href = `/hr/onboarding/${onb.id}`;

                        return (
                          <Link key={onb.id} href={href}>
                            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm transition-shadow hover:shadow-md">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="text-xs font-medium text-slate-900">
                                    {onb.driverName}
                                  </div>
                                  {onb.location && (
                                    <div className="mt-0.5 text-[11px] text-slate-500">
                                      {onb.location}
                                    </div>
                                  )}
                                  <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                                      📞 {onb.phone}
                                    </span>
                                    {onb.responsible && (
                                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                                        Verantw.: {onb.responsible}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500">
                                  {onb.targetStartDateLabel && (
                                    <span>{onb.targetStartDateLabel}</span>
                                  )}
                                  {onb.linkedDriverId && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                      Mit Fahrer verknüpft
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                                <div className="flex items-center gap-1">
                                  <span>📄</span>
                                  <span>Dok./Vertrag prüfen</span>
                                </div>
                                <span className="text-[10px] text-indigo-600 group-hover:text-indigo-700">
                                  Details öffnen
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}

                      {stageCases.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-400">
                          Noch keine Kandidaten in dieser Phase.
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </PageState>
    </>
  );
}
