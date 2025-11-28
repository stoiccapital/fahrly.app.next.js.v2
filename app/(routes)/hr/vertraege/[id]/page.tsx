import { notFound } from "next/navigation";
import { getContractById } from "@/lib/mocks/hrContractMocks";
import { VertragDetailClient } from "../_components/VertragDetailClient";

type PageProps = {
  params: {
    id: string;
  };
};

export default function VertragDetailPage({ params }: PageProps) {
  const contract = getContractById(params.id);

  if (!contract) {
    notFound();
  }

  return <VertragDetailClient contract={contract} />;
}

