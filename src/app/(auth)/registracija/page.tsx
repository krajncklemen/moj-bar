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

export default function RegistracijaPage() {
  const router = useRouter();
  const { registerOwner } = useStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await registerOwner({ fullName, email, password });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Registracija ni uspela");
      return;
    }
    toast.success("Račun ustvarjen – nastavimo lokacijo");
    router.push("/onboarding");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 text-slate-900 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,#99f6e4_0%,transparent_30%),linear-gradient(180deg,#f8fafc,#f0fdfa)] dark:bg-[linear-gradient(180deg,#020617,#042f2e)]" />
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
            Moj Bar
          </div>
          <CardTitle className="mt-2 text-2xl text-slate-900 dark:text-white">
            Registracija lastnika
          </CardTitle>
          <CardDescription>
            V manj kot 5 minutah ustvari lokacijo in urnik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="name">Ime in priimek</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-pošta</Label>
              <Input
                id="email"
                type="email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <Button className="w-full text-white" type="submit" size="lg" disabled={loading}>
              {loading ? "Ustvarjam…" : "Ustvari račun"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            Že imate račun?{" "}
            <Link
              href="/prijava"
              className="font-medium text-teal-700 dark:text-teal-300"
            >
              Prijava
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
