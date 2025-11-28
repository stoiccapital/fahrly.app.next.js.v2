"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import clsx from "clsx";

type NavChild = {
  label: string;
  href: string;
};

type NavSectionId = "home" | "hr" | "fleet" | "finance" | "settings";

type NavSection = {
  id: NavSectionId;
  label: string;
  href: string;
  children?: NavChild[];
};

const navSections: NavSection[] = [
  {
    id: "home",
    label: "Home",
    href: "/home",
  },
  {
    id: "hr",
    label: "HR",
    href: "/hr",
    children: [
      { label: "Fahrer", href: "/hr/fahrer" },
      { label: "Onboarding", href: "/hr/onboarding" },
      { label: "Schichten", href: "/hr/schichten" },
      { label: "Zeiterfassung", href: "/hr/zeiterfassung" },
      { label: "Gehaltsrechner", href: "/hr/gehaltsrechner" },
      { label: "Urlaub & Abwesenheit", href: "/hr/urlaub" },
      { label: "Dokumente", href: "/hr/dokumente" },
      { label: "Verträge", href: "/hr/vertraege" },
      { label: "Leistungsübersicht", href: "/hr/leistungsuebersicht" },
    ],
  },
  {
    id: "fleet",
    label: "Fleet",
    href: "/fleet",
    children: [
      { label: "Fahrzeuge", href: "/fleet/fahrzeuge" },
      { label: "Wartung", href: "/fleet/wartung" },
      { label: "Kraftstoff", href: "/fleet/kraftstoff" },
      { label: "Schäden & Unfälle", href: "/fleet/schaeden-unfaelle" },
      { label: "Versicherungen", href: "/fleet/versicherungen" },
      { label: "Zulassung & Prüfung", href: "/fleet/zulassung-pruefung" },
      { label: "Kosten pro Fahrzeug", href: "/fleet/kosten-pro-fahrzeug" },
      { label: "Telematik", href: "/fleet/telematik" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    href: "/finance",
    children: [
      { label: "Rechnungen", href: "/finance/rechnungen" },
      { label: "Einnahmen", href: "/finance/einnahmen" },
      { label: "Kosten", href: "/finance/kosten" },
      { label: "Verbindlichkeiten", href: "/finance/verbindlichkeiten" },
      { label: "Cashflow", href: "/finance/cashflow" },
      { label: "Gewinn & Verlust", href: "/finance/gewinn-verlust" },
      { label: "Steuern & Rücklagen", href: "/finance/steuern-ruecklagen" },
      { label: "Berichte", href: "/finance/berichte" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
  },
];

function getActiveSectionId(pathname: string): NavSectionId {
  if (pathname.startsWith("/hr")) return "hr";
  if (pathname.startsWith("/fleet")) return "fleet";
  if (pathname.startsWith("/finance")) return "finance";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/home")) return "home";
  return "home";
}

export function Sidebar() {
  const pathname = usePathname();
  const activeSectionId = getActiveSectionId(pathname);

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white">
          F
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">Fahrly</span>
          <span className="text-xs text-slate-500">Fleet OS</span>
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-4 text-sm">
        <div>
          <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Navigation
          </div>
          <ul className="space-y-1">
            {navSections.map((section) => {
              const isActiveSection = section.id === activeSectionId;

              return (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className={clsx(
                      "flex items-center justify-between rounded-xl px-2.5 py-2 text-sm",
                      isActiveSection
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span>{section.label}</span>
                  </Link>

                  {section.children && isActiveSection && (
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {section.children.map((child) => {
                        const isChildActive =
                          pathname === child.href ||
                          (pathname.startsWith(child.href) && child.href !== "/");

                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={clsx(
                                "flex items-center rounded-lg px-2 py-1.5 text-xs",
                                isChildActive
                                  ? "bg-slate-100 text-slate-900 font-medium"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              )}
                            >
                              <span className="truncate">{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
            AC
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-900">Anh Chu</span>
            <span className="text-[11px] text-slate-500">Operator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
