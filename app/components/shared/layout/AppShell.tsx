import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar column is fixed and does not shrink */}
      <div className="shrink-0">
        <Sidebar />
      </div>

      {/* Main app column */}
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
