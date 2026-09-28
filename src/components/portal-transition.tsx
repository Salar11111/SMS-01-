"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

type Phase = "idle" | "open" | "hold" | "close";

type PortalContextValue = {
  enter: (x: number, y: number, href: string) => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

const OPEN_MS = 820;
const CLOSE_MS = 560;
const HOLD_LIMIT_MS = 8000;

export function PortalTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const destination = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("idle");

  const setPhaseBoth = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const enter = useCallback(
    (x: number, y: number, href: string) => {
      if (phaseRef.current !== "idle") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      destination.current = href.split("?")[0] || href;
      setOrigin({ x, y });
      setPhaseBoth("open");
      window.setTimeout(() => {
        if (phaseRef.current !== "open") return;
        setPhaseBoth("hold");
        router.push(href);
      }, OPEN_MS);
    },
    [router, setPhaseBoth],
  );

  useEffect(() => {
    if (phase !== "hold" || !destination.current) return;
    const dest = destination.current;
    const arrived = pathname === dest || pathname.startsWith(`${dest}/`);
    const id = window.setTimeout(
      () => setPhaseBoth("close"),
      arrived ? 40 : HOLD_LIMIT_MS,
    );
    return () => window.clearTimeout(id);
  }, [pathname, phase, setPhaseBoth]);

  useEffect(() => {
    if (phase !== "close") return;
    const id = window.setTimeout(() => {
      destination.current = null;
      setPhaseBoth("idle");
    }, CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [phase, setPhaseBoth]);

  return (
    <PortalContext.Provider value={{ enter }}>
      {children}
      {phase !== "idle" ? (
        <div className={`portal-overlay portal-overlay-${phase}`} aria-hidden="true">
          <div className="portal-origin" style={{ left: origin.x, top: origin.y }}>
            <div className="portal-iris" />
            <span className="portal-ripple" />
            <div className="portal-ring-spin">
              <span className="portal-ring" />
            </div>
            <div className="portal-ring-spin portal-ring-spin-reverse">
              <span className="portal-ring portal-ring-b" />
            </div>
            <span className="portal-core" />
          </div>
        </div>
      ) : null}
    </PortalContext.Provider>
  );
}

export function PortalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const portal = useContext(PortalContext);
  if (!portal) {
    throw new Error("PortalLink must be used within PortalTransition");
  }
  const { enter } = portal;

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const fromKeyboard = event.detail === 0;
    const x = fromKeyboard ? rect.left + rect.width / 2 : event.clientX;
    const y = fromKeyboard ? rect.top + rect.height / 2 : event.clientY;
    event.preventDefault();
    enter(x, y, href);
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
