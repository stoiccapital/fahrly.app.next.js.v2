import { getMockContractData } from "@/lib/mocks/hrContractMocks";
import { VertraegePageClient } from "./_components/VertraegePageClient";

export default function VertraegePage() {
  const { contracts, kpis } = getMockContractData();

  return (
    <VertraegePageClient
      contractsFromServer={contracts}
      kpisFromServer={kpis}
    />
  );
}

