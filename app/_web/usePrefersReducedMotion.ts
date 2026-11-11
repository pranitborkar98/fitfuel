import { useSyncExternalStore } from "react";

/* ── READING prefers-reduced-motion WITHOUT A HYDRATION MISMATCH ─────────
   useSyncExternalStore, not useState + useEffect. The server has no
   matchMedia, so the first client render MUST agree with the server's
   (false) and only then swap — which is exactly what getServerSnapshot is
   for. The effect-and-setState version does the same thing by cascading a
   second render and trips react-hooks' no-setstate-in-effect rule.

   This reads the reduced-motion PREFERENCE, not the viewport: it gates
   JavaScript intervals (which CSS cannot stop), never layout. The viz
   contracts still ban viewport reads (useMediaQuery, innerWidth, width
   matchMedia) in the homepage files; this hook is the one sanctioned
   exception, and it lives here so the rule stays checkable in one place. */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function readPreference(): boolean {
  return window.matchMedia(QUERY).matches;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, readPreference, () => false);
}
