import { getMockLeaveData } from "@/lib/mocks/hrLeaveMocks";
import { UrlaubPageClient } from "./_components/UrlaubPageClient";

export default function UrlaubPage() {
  const { requests } = getMockLeaveData();

  return <UrlaubPageClient requestsFromServer={requests} />;
}

