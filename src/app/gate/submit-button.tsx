"use client";

import { useFormStatus } from "react-dom";

/**
 * The gate is a server component, so there is no local state to drive a
 * pending label. useFormStatus reads the status of the enclosing <form>, which
 * is why this has to be its own client component rendered inside that form
 * rather than part of the page.
 */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-4 w-full bg-ink py-3 text-[12px] font-medium tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85 disabled:opacity-40"
      disabled={pending}
      type="submit"
    >
      {pending ? "Loading…" : children}
    </button>
  );
}
