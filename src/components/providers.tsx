"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { PortalTransition } from "@/components/portal-transition";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
        <PortalTransition>{children}</PortalTransition>
      </ThemeProvider>
    </SessionProvider>
  );
}
