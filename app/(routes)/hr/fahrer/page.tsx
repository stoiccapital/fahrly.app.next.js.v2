import type { DriverDocumentStatus, DriverStatus } from "../_types";
import { DriverList } from "./_components/DriverList";

type FahrerListPageProps = {
  searchParams?: {
    q?: string;
    status?: string;
    docs?: string;
  };
};

export default function FahrerListPage({ searchParams }: FahrerListPageProps) {
  const searchQuery = searchParams?.q ?? "";

  const statusParam = searchParams?.status;
  const docsParam = searchParams?.docs;

  const statusFilter: DriverStatus | "all" =
    statusParam === "active" ||
    statusParam === "onboarding" ||
    statusParam === "incomplete" ||
    statusParam === "blocked" ||
    statusParam === "inactive"
      ? statusParam
      : "all";

  const docsFilter: DriverDocumentStatus | "all" =
    docsParam === "ok" ||
    docsParam === "attention" ||
    docsParam === "missing"
      ? docsParam
      : "all";

  return (
    <DriverList
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      docsFilter={docsFilter}
    />
  );
}

