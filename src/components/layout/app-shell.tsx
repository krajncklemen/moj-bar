"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Users,
  Wallet,
  Clock3,
  MapPin,
  Layers,
  Award,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useStore } from "@/lib/demo/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/lokacija", label: "Lokacija", icon: MapPin },
  { href: "/smene", label: "Smene", icon: Layers },
  { href: "/zaposleni", label: "Zaposleni", icon: Users },
  { href: "/dejansko", label: "Dejansko", icon: Clock3 },
  { href: "/dopusti", label: "Dopusti", icon: ClipboardList },
  { href: "/promet", label: "Promet", icon: BarChart3 },
  { href: "/opomniki", label: "Opomniki", icon: CheckSquare },
  { href: "/dolzniki", label: "Dolžniki", icon: Wallet },
  { href: "/uspesnost", label: "Uspešnost", icon: Award },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { session, location, ready, logout, isOwner } = useStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/prijava");
      return;
    }
    if (!location) {
      router.replace("/onboarding");
    }
  }, [ready, session, location, router]);

  if (!ready || !session || !location) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Nalagam…
      </div>
    );
  }

  const nav = isOwner ? NAV : NAV.filter((n) =>
    ["/urnik", "/dopusti", "/opomniki"].includes(n.href)
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#ecfdf5_0%,_#f8fafc_45%,_#f1f5f9_100%)] dark:bg-[radial-gradient(ellipse_at_top,_#042f2e_0%,_#020617_50%,_#0f172a_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-slate-200/70 bg-white/95 p-4 backdrop-blur transition dark:border-slate-800 dark:bg-slate-950/95 lg:static lg:translate-x-0",
            open && "translate-x-0"
          )}
        >
          <div className="mb-4 flex items-center justify-between px-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                Moj Bar
              </div>
              <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {location.name}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pb-4">
            <Link
              href="/urnik"
              onClick={() => setOpen(false)}
              className={cn(
                "mb-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                pathname === "/" || pathname === "/urnik"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Pregled / Urnik
            </Link>
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-slate-200/70 pt-3 dark:border-slate-800">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="font-medium text-slate-700 dark:text-slate-200">
                {session.profile.fullName}
              </div>
              <div className="text-slate-500">
                {session.role === "owner" ? "Lastnik" : "Zaposleni"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  logout();
                  router.push("/prijava");
                }}
              >
                <LogOut className="h-4 w-4" />
                Odjava
              </Button>
            </div>
          </div>
        </aside>

        {open && (
          <button
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Zapri meni"
          />
        )}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-sm font-semibold tracking-wide text-teal-700">
              MOJ BAR
            </div>
            <div className="w-10" />
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
