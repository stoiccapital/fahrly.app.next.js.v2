import { PageHeader, PageState } from "@/app/components/shared/layout";

import { Button, Card } from "@/app/components/shared/ui";

export default function HomePage() {
  const status: "ready" = "ready";

  return (
    <>
      <PageHeader
        title="Home"
        description="Overview of your fleet, people, and finances in one place."
        primaryAction={
          <Button>
            Add vehicle
          </Button>
        }
        secondaryActions={
          <Button variant="secondary" size="sm">
            Invite user
          </Button>
        }
      />

      <PageState status={status}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-slate-900">
                  Fleet
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Vehicles, trips, utilization, and maintenance health.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                Module
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Active vehicles</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">0</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">In service</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">0</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Issues</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">0</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-slate-900">
                  HR
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Drivers, compliance, contracts, and documentation.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                Module
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Active drivers</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">0</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Expiring docs (30d)</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">0</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-slate-900">
                  Finance
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Revenue, payouts, and operating costs across your fleet.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                Module
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Monthly revenue</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  €0
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Outstanding</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  €0
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageState>
    </>
  );
}

