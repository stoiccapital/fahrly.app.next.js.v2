import type { ReactNode } from "react";

import { Card } from "@/app/components/shared/ui";

export type PageStatus = "loading" | "empty" | "error" | "ready";

export type PageStateProps = {
  status: PageStatus;
  children: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  errorTitle?: string;
  errorDescription?: string;
  errorAction?: ReactNode;
};

export function PageState({
  status,
  children,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Once you start adding data, it will show up here.",
  emptyAction,
  errorTitle = "Something went wrong",
  errorDescription = "We couldn't load this data. Please try again.",
  errorAction,
}: PageStateProps) {
  if (status === "loading") {
    return (
      <div className="space-y-4">
        <Card>
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
        </Card>
        <Card>
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <Card className="flex flex-col items-start justify-center gap-3 py-8">
        <h2 className="text-sm font-medium text-slate-900">{emptyTitle}</h2>
        <p className="text-sm text-slate-600">{emptyDescription}</p>
        {emptyAction ? <div className="mt-2">{emptyAction}</div> : null}
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="flex flex-col items-start justify-center gap-3 border-red-200 bg-red-50/60">
        <h2 className="text-sm font-medium text-red-800">{errorTitle}</h2>
        <p className="text-sm text-red-700">{errorDescription}</p>
        {errorAction ? <div className="mt-2">{errorAction}</div> : null}
      </Card>
    );
  }

  return <>{children}</>;
}

