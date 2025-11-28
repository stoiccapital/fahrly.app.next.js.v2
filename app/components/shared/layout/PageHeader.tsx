import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryActions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      {(primaryAction || secondaryActions) && (
        <div className="flex items-center gap-2 sm:justify-end">
          {secondaryActions ? (
            <div className="flex items-center gap-2">{secondaryActions}</div>
          ) : null}
          {primaryAction ? <div>{primaryAction}</div> : null}
        </div>
      )}
    </div>
  );
}

