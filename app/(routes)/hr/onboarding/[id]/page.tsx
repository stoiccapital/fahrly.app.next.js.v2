import { PageHeader, PageState } from "@/app/components/shared/layout";
import { Button } from "@/app/components/shared/ui";
import { getMockOnboardingDetail } from "@/app/(routes)/hr/onboarding/_data/mockOnboarding";
import { OnboardingDetailView } from "../_components/OnboardingDetailView";

type OnboardingDetailPageProps = {
  params: {
    id: string;
  };
};

export default function OnboardingDetailPage({ params }: OnboardingDetailPageProps) {
  const onboarding = getMockOnboardingDetail(params.id);

  if (!onboarding) {
    return (
      <>
        <PageHeader
          title="Onboarding"
          description="Onboarding-Detailansicht"
          primaryAction={null}
        />
        <PageState
          status="error"
          errorTitle="Onboarding-Fall nicht gefunden"
          errorDescription="Der ausgewählte Onboarding-Fall existiert nicht oder wurde entfernt."
          errorAction={
            <a href="/hr/onboarding">
              <Button variant="secondary">Zur Onboarding-Übersicht</Button>
            </a>
          }
        >
          {null}
        </PageState>
      </>
    );
  }

  return <OnboardingDetailView onboarding={onboarding} />;
}

