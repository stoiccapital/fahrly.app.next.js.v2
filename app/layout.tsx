import type { Metadata } from "next";

import type { ReactNode } from "react";

import "@/app/globals.css";

import { AppShell } from "@/app/components/shared/layout";

export const metadata: Metadata = {
  title: "Fahrly",
  description: "Fahrly v2 — Modular fleet-management SaaS",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

