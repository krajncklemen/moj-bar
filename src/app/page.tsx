"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/demo/store";

export default function HomePage() {
  const router = useRouter();
  const { ready, session, location } = useStore();

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/prijava");
    else if (!location) router.replace("/onboarding");
    else router.replace("/urnik");
  }, [ready, session, location, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
      Nalagam MOJ BAR…
    </div>
  );
}
