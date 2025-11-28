import { getMockDocumentData } from "@/lib/mocks/hrDocumentMocks";
import { DokumentePageClient } from "./_components/DokumentePageClient";

export default function DokumentePage() {
  const { requiredTypes, compliances, files, kpis } = getMockDocumentData();

  return (
    <DokumentePageClient
      requiredTypes={requiredTypes}
      compliancesFromServer={compliances}
      filesFromServer={files}
      kpisFromServer={kpis}
    />
  );
}

