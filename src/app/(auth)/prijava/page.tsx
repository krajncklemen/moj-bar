"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";

export default function PrijavaPage() {
  const router = useRouter();
  const { login, loadSampleData } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Prijava ni uspela");
      return;
    }
    toast.success("Dobrodošli!");
    router.push("/urnik");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-slate-900 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#99f6e4_0%,transparent_35%),radial-gradient(circle_at_80%_0%,#a5f3fc_0%,transparent_30%),linear-gradient(180deg,#f8fafc,#ecfeff)] dark:bg-[radial-gradient(circle_at_20%_20%,#115e59_0%,transparent_35%),linear-gradient(180deg,#020617,#042f2e)]" />
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
            Moj Bar
          </div>
          <CardTitle className="mt-2 text-2xl text-slate-900 dark:text-white">
            Prijava
          </CardTitle>
          <CardDescription>
            Upravljaj urnik, smene in ekipo na enem mestu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">E-pošta</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Geslo</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full text-white" type="submit" size="lg" disabled={loading}>
              {loading ? "Prijavljam…" : "Prijava"}
            </Button>
          </form>
          <div className="mt-4 space-y-3 text-center text-sm text-slate-600 dark:text-slate-300">
            <p>
              Nimate računa?{" "}
              <Link
                href="/registracija"
                className="font-medium text-teal-700 dark:text-teal-300"
              >
                Registracija lastnika
              </Link>
            </p>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-3 text-left dark:border-slate-600 dark:bg-slate-950/60">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Lokalni vzorčni način (brez strežniškega Auth) – naloži primer
                lokacije z urnikom.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 w-full"
                onClick={() => {
                  loadSampleData();
                  toast.message("Naloženi vzorčni podatki");
                  router.push("/urnik");
                }}
              >
                Naloži vzorčne podatke
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
