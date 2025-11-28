import { getMockTimeEntryData } from "@/lib/mocks/hrTimeEntryMocks";
import { ZeiterfassungPageClient } from "./_components/ZeiterfassungPageClient";

export default function ZeiterfassungPage() {
  const { weekStartDate, drivers, entries, kpis } = getMockTimeEntryData();

  return (
    <ZeiterfassungPageClient
      weekStartDate={weekStartDate}
      drivers={drivers}
      entries={entries}
      kpis={kpis}
    />
  );
}

