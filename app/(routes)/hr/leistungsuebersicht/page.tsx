import {
  getDefaultPerformancePeriod,
  getPerformanceForPeriod,
  getPerformancePeriods,
} from "@/lib/mocks/hrPerformanceMocks";
import { LeistungsuebersichtPageClient } from "./_components/LeistungsuebersichtPageClient";

export default function LeistungsuebersichtPage() {
  const period = getDefaultPerformancePeriod();
  const { performances, kpis } = getPerformanceForPeriod(period.id);
  const allPeriods = getPerformancePeriods();

  return (
    <LeistungsuebersichtPageClient
      initialPeriod={period}
      allPeriods={allPeriods}
      performancesFromServer={performances}
      kpisFromServer={kpis}
    />
  );
}

