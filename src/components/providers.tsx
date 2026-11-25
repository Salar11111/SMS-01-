"use client";

import { ThemeProvider } from "next-themes";
import { PortalTransition } from "@/components/portal-transition";

export function Providers({ children }: { children: React.ReactNode }) {
  // Session state is read on the server via auth(). A client SessionProvider would
  // poll /api/auth/session, which re-signs the JWT cookie on every response; a poll
  // still in flight when sign-out clears the cookie can restore the session.
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <PortalTransition>{children}</PortalTransition>
    </ThemeProvider>
  );
}
