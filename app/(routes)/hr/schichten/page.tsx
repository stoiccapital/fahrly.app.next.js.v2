import { getMockShiftPlanningData } from "@/lib/mocks/hrShiftMocks";
import { SchichtenPageClient } from "./_components/SchichtenPageClient";

export default function SchichtenPage() {
  const { weekStartDate, drivers, vehicles, shifts, kpis } =
    getMockShiftPlanningData();

  return (
    <SchichtenPageClient
      weekStartDate={weekStartDate}
      drivers={drivers}
      vehicles={vehicles}
      shifts={shifts}
      kpis={kpis}
    />
  );
}

