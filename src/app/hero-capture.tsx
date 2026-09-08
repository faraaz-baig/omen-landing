"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlist } from "./actions/waitlist";

/**
 * The hero's email capture: one paper pill that is the form, replacing the
 * button-that-opened-a-dialog. The page's whole job is collecting an email,
 * so the field sits in first view with nothing between intent and typing.
 * The dialog stays mounted for entry points far from the hero (the header's
 * Get a kit) — both post to the same action.
 */
function Fields({ error }: { error: string | null }) {
  // useFormStatus, not local state — see waitlist.tsx for why a setState
  // inside the action never paints.
  const { pending } = useFormStatus();

  return (
    <>
      <div className="flex h-[54px] w-full items-center rounded-[var(--radius-frame)] bg-paper p-[5px] pl-4 sm:h-[58px] sm:p-1.5 sm:pl-5">
        <input
          aria-label="Email address"
          autoComplete="email"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-2/55 disabled:opacity-50"
          disabled={pending}
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <button
          className="h-[44px] shrink-0 rounded-[4px] bg-ink px-4 text-[11px] leading-none font-medium tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85 disabled:opacity-40 sm:h-[46px] sm:px-5"
          disabled={pending}
          type="submit"
        >
          {pending ? "Sending…" : "Request a kit"}
        </button>
      </div>

      {/* One line under the pill doing double duty: reassurance by default,
          the error when there is one. Ember fails contrast on the espresso
          scrim, so the error takes a lightened tint of the same hue. The
          min-h reserves the line so the hero doesn't jump. */}
      <p aria-live="polite" className="mt-3.5 min-h-[1.25rem] text-[12px] leading-5 sm:text-[13px]">
        {error ? (
          <span className="text-[#f0a48c]">{error}</span>
        ) : (
          <span className="text-white/70">
            We&rsquo;ll follow up by email to arrange delivery of your DNA kit.
          </span>
        )}
      </p>
    </>
  );
}

export function HeroCapture() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (formData: FormData) => {
    setError(null);
    const result = await joinWaitlist(String(formData.get("email") ?? ""));
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.message);
    }
  };

  // Success replaces the form in place — the confirmation needs no decision,
  // and re-showing an empty field would read as "that didn't work".
  if (done) {
    return (
      <p
        aria-live="polite"
        className="mt-7 text-[15px] leading-6 text-white sm:text-[16px]"
        role="status"
      >
        Look out for an email from us about your kit.
      </p>
    );
  }

  return (
    <form action={submit} className="mx-auto mt-7 w-full max-w-[480px]">
      <Fields error={error} />
    </form>
  );
}
