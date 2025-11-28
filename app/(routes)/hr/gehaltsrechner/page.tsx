import { getMockPayrollData } from "@/lib/mocks/hrPayrollMocks";
import { GehaltsrechnerPageClient } from "./_components/GehaltsrechnerPageClient";

export default function GehaltsrechnerPage() {
  const { periods, lines, defaultPeriodId, kpis } = getMockPayrollData();

  return (
    <GehaltsrechnerPageClient
      periods={periods}
      lines={lines}
      defaultPeriodId={defaultPeriodId}
      initialKpis={kpis}
    />
  );
}

