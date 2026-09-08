"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlist } from "./actions/waitlist";

/**
 * Pending state comes from useFormStatus, not local state. `<form action={fn}>`
 * runs the action inside a transition, so a setState("sending") made there is a
 * deferred update React may never commit before the action resolves — the
 * loading label simply would not paint. useFormStatus reads the form's real
 * in-flight status, which is why this has to be a child of the form.
 */
function FormFields({ error }: { error: string | null }) {
  const { pending } = useFormStatus();

  return (
    <>
      {/* rule under the field rather than a box: closer to the type-led
          treatment on the rest of the page than a bordered input */}
      <input
        aria-label="Email address"
        autoComplete="email"
        className="mt-7 w-full border-b border-ink/20 bg-transparent pb-3 text-[17px] leading-7 outline-none transition-colors placeholder:text-ink-2/50 focus:border-ink"
        disabled={pending}
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />

      <p aria-live="polite" className="min-h-[1.25rem]">
        {error && (
          <span className="mt-2 block text-[13px] text-ember">{error}</span>
        )}
      </p>

      <button
        className="mt-4 w-full bg-ink py-3.5 text-[12px] font-medium tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85 disabled:opacity-40"
        disabled={pending}
        type="submit"
      >
        {pending ? "Loading…" : "Request a kit"}
      </button>
    </>
  );
}

type State = "idle" | "done";

const WaitlistContext = createContext<(() => void) | null>(null);

/** Opens the one dialog on the page. Throws outside the provider rather than
 *  handing back a no-op that fails silently when a trigger is misplaced. */
export function useWaitlist() {
  const open = useContext(WaitlistContext);
  if (!open) throw new Error("useWaitlist must be used inside <WaitlistProvider>");
  return open;
}

/**
 * Owns the single <dialog> for the page and exposes its opener through
 * context, so the header button and the hero link drive the same instance.
 * Rendering a dialog per trigger would duplicate the form, its state and its
 * id, and let two copies disagree about whether you already signed up.
 *
 * Native <dialog> rather than a div: showModal() gives focus trapping,
 * Esc-to-close, inert background content, and top-layer stacking from the
 * platform, none of which is worth reimplementing.
 */
export function WaitlistProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setState("idle");
    setError(null);
    dialogRef.current?.showModal();
  };

  // Clicking the backdrop closes. The dialog element itself fills the top
  // layer, so a click landing on <dialog> rather than its child panel is a
  // backdrop click.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === el) el.close();
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  const submit = async (formData: FormData) => {
    setError(null);
    const result = await joinWaitlist(String(formData.get("email") ?? ""));
    if (result.ok) {
      setState("done");
    } else {
      setError(result.message);
    }
  };

  return (
    <WaitlistContext.Provider value={open}>
      {children}

      <dialog
        aria-label={state === "done" ? "Request received" : "Request a kit"}
        // text-left: a trigger may sit inside the hero's centred text block and
        // the dialog would otherwise inherit that centring.
        className="waitlist-dialog w-[min(30rem,calc(100vw-2rem))] bg-paper p-8 text-left text-ink sm:p-10"
        ref={dialogRef}
      >
        <button
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-[16px] leading-none text-ink-2 transition-colors hover:text-ink"
          onClick={() => dialogRef.current?.close()}
          type="button"
        >
          ×
        </button>

        {state === "done" ? (
          <div aria-live="polite">
            {/* No heading, mirroring the form state. With one line carrying the
                whole confirmation it takes the full ink colour rather than the
                muted tone used for supporting copy. */}
            <p className="max-w-[38ch] text-[17px] leading-8 text-ink">
              Look out for an email from us about your kit.
            </p>
            <button
              className="mt-7 w-full bg-ink py-3.5 text-[12px] font-medium tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              Close
            </button>
          </div>
        ) : (
          <form action={submit}>
            <p className="max-w-[38ch] text-[17px] leading-8 text-ink-2">
              We&rsquo;ll follow up by email to arrange delivery of your DNA
              kit.
            </p>

            <FormFields error={error} />
          </form>
        )}
      </dialog>
    </WaitlistContext.Provider>
  );
}

/** The hero's underlined link-style trigger. */
export function WaitlistCta() {
  const open = useWaitlist();

  return (
    // uppercase needs tracking to breathe, and the trailing letter-space
    // pushes the underline past the final glyph, so the negative margin
    // cancels it and keeps the rule flush and centred.
    <button
      className="mt-7 -mr-[0.14em] inline-block border-b border-white/70 pb-[5px] text-[13px] leading-none font-medium tracking-[0.14em] text-white uppercase transition-colors hover:border-white sm:text-[14px]"
      onClick={open}
      type="button"
    >
      Request a test kit
    </button>
  );
}
