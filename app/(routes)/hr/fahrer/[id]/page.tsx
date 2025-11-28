import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button } from "@/app/components/shared/ui";
import { getMockDriverDetail } from "@/lib/mocks/hrDriverMocks";
import { DriverDetailView } from "../_components/DriverDetail";

type FahrerDetailPageProps = {
  params: {
    id: string;
  };
};

export default function FahrerDetailPage({ params }: FahrerDetailPageProps) {
  const driver = getMockDriverDetail(params.id);

  if (!driver) {
    // Option A: use Next notFound
    // notFound();

    // Option B: friendly error state (keeping HR shell)
    return (
      <>
        <PageHeader
          title="Fahrer"
          description="Fahrer-Detailansicht"
          primaryAction={null}
        />
        <PageState
          status="error"
          errorTitle="Fahrer nicht gefunden"
          errorDescription="Der ausgewählte Fahrer existiert nicht oder wurde entfernt."
          errorAction={
            <a href="/hr/fahrer">
              <Button variant="secondary">Zur Fahrerübersicht</Button>
            </a>
          }
        />
      </>
    );
  }

  return <DriverDetailView driver={driver} />;
}

