"use client";

import type { ReactNode } from "react";

/**
 * The Omen preview is light-only by design (Calvin Klein register: paper,
 * ink, one ember accent). The template synced to OS dark mode here; we
 * deliberately do not.
 */
export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  return <>{children}</>;
}
