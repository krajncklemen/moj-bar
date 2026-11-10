"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { DemoStoreProvider } from "@/lib/demo/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DemoStoreProvider>
        {children}
        <Toaster richColors position="top-center" closeButton />
      </DemoStoreProvider>
    </ThemeProvider>
  );
}
