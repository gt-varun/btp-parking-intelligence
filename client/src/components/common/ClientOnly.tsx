import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders children only after mount in the browser. Use to wrap leaflet,
 * which touches `window`/`document` during render.
 */
export function ClientOnly({ children, fallback }: { children: () => ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(children);
  ref.current = children;
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback ?? null}</>;
  return <>{ref.current()}</>;
}
