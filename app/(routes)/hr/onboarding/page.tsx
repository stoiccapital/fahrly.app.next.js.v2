import type { OnboardingStage } from "@/app/(routes)/hr/_types";
import { OnboardingBoard } from "./_components/OnboardingBoard";

type OnboardingPageProps = {
  searchParams?: {
    q?: string;
    stage?: string;
    location?: string;
    responsible?: string;
  };
};

export default function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const searchQuery = searchParams?.q ?? "";
  const locationFilter = searchParams?.location ?? "";
  const responsibleFilter = searchParams?.responsible ?? "";

  const stageParam = searchParams?.stage;
  const stageFilter: OnboardingStage | "all" =
    stageParam === "lead" ||
    stageParam === "docs_pending" ||
    stageParam === "contract_pending" ||
    stageParam === "training" ||
    stageParam === "start_scheduled" ||
    stageParam === "completed" ||
    stageParam === "cancelled"
      ? stageParam
      : "all";

  return (
    <OnboardingBoard
      searchQuery={searchQuery}
      stageFilter={stageFilter}
      locationFilter={locationFilter}
      responsibleFilter={responsibleFilter}
    />
  );
}

