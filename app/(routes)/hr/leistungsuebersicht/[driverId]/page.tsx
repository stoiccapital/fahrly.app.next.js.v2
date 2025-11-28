import { notFound } from "next/navigation";
import {
  getDefaultPerformancePeriod,
  getDriverPerformanceForPeriod,
  getPerformancePeriods,
} from "@/lib/mocks/hrPerformanceMocks";
import { LeistungsuebersichtDriverDetailClient } from "../_components/LeistungsuebersichtDriverDetailClient";

type PageProps = {
  params: {
    driverId: string;
  };
  searchParams?: {
    period?: string;
  };
};

export default function LeistungsuebersichtDriverDetailPage({
  params,
  searchParams,
}: PageProps) {
  const allPeriods = getPerformancePeriods();
  const fallbackPeriod = getDefaultPerformancePeriod();
  const periodId =
    (searchParams?.period as string | undefined) ?? fallbackPeriod.id;

  const period =
    allPeriods.find((p) => p.id === periodId) ?? fallbackPeriod;

  const performance = getDriverPerformanceForPeriod(params.driverId, period.id);

  if (!performance) {
    notFound();
  }

  return (
    <LeistungsuebersichtDriverDetailClient
      performance={performance}
      period={period}
    />
  );
}

