"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, session, location, completeOnboarding } = useStore();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/prijava");
    else if (location) router.replace("/urnik");
  }, [ready, session, location, router]);

  if (!ready || !session || location) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500 dark:text-slate-300">
        Nalagam…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#ccfbf1,transparent_40%),#f8fafc] px-4 py-10 text-slate-900 dark:bg-[#020617] dark:text-slate-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
            Moj Bar · korak 1/1
          </div>
          <CardTitle className="mt-2 text-2xl text-slate-900 dark:text-white">
            Ustvari lokacijo
          </CardTitle>
          <CardDescription>
            Pozdravljeni, {session.profile.fullName}. Nato lahko takoj urejate urnik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              completeOnboarding({ locationName: name, address });
              toast.success("Lokacija ustvarjena");
              router.push("/urnik");
            }}
          >
            <div>
              <Label htmlFor="loc">Ime lokacije / bara</Label>
              <Input
                id="loc"
                placeholder="npr. Bar Center"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="addr">Naslov (neobvezno)</Label>
              <Input
                id="addr"
                placeholder="Ulica, kraj"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <Button className="w-full" size="lg">
              Nadaljuj na urnik
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
