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
      {/* enclosed, not underlined: once the banner, buttons and dialog took
          hairline borders and the shared --radius-frame, a bare rule read as
          a holdover. Transparent bg and a border that darkens to full ink on
          focus keep it as quiet as the underline was. */}
      <input
        aria-label="Email address"
        autoComplete="email"
        className="mt-7 w-full rounded-[var(--radius-frame)] border border-ink/20 bg-transparent px-4 py-3.5 text-[17px] leading-7 outline-none transition-colors placeholder:text-ink-2/50 focus:border-ink"
        disabled={pending}
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />

      {/* the error line's full height is reserved (min-h matches its one line
          of 13px type) so the button does not jump when a message appears.
          The margins around the slot are minimal because the slot itself is
          already 20px of separation between two boxed elements — with the
          old underline field this whole run was 36px and read as the button
          drifting away from the form. */}
      <p aria-live="polite" className="mt-0.5 min-h-[1.25rem]">
        {error && (
          <span className="block text-[13px] leading-[1.25rem] text-ember">
            {error}
          </span>
        )}
      </p>

      <button
        className="mt-0.5 w-full rounded-[var(--radius-frame)] bg-ink py-3.5 text-[12px] font-medium tracking-[0.16em] text-paper uppercase transition-opacity hover:opacity-85 disabled:opacity-40"
        disabled={pending}
        type="submit"
      >
        {pending ? "Loading…" : "Request a kit"}
      </button>
    </>
  );
}

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
  const [error, setError] = useState<string | null>(null);
  // Success shows as a toast, not a dialog state: the confirmation needs no
  // decision from the user, so it should not hold the page hostage behind a
  // modal that has to be dismissed.
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    setError(null);
    dialogRef.current?.showModal();
  };

  const showToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(true);
    toastTimer.current = setTimeout(() => setToast(false), 5000);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

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
      dialogRef.current?.close();
      showToast();
    } else {
      setError(result.message);
    }
  };

  return (
    <WaitlistContext.Provider value={open}>
      {children}

      <dialog
        aria-label="Request a kit"
        // text-left: a trigger may sit inside the hero's centred text block and
        // the dialog would otherwise inherit that centring.
        className="waitlist-dialog w-[min(30rem,calc(100vw-2rem))] rounded-[var(--radius-frame)] bg-paper p-8 text-left text-ink sm:p-10"
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

        <form action={submit}>
          <p className="max-w-[38ch] text-[17px] leading-8 text-ink-2">
            We&rsquo;ll follow up by email to arrange delivery of your DNA kit.
          </p>

          <FormFields error={error} />
        </form>
      </dialog>

      {/* The live region stays mounted with the message swapping inside it —
          inserting role="status" and its text together in one commit is the
          case screen readers most often miss. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4"
        role="status"
      >
        {toast && (
          <p className="toast-in pointer-events-auto rounded-[var(--radius-frame)] border border-ink/12 bg-paper px-5 py-4 text-[15px] leading-6 text-ink shadow-[0_16px_48px_-16px_rgb(0_0_0/0.3)]">
            Look out for an email from us about your kit.
          </p>
        )}
      </div>
    </WaitlistContext.Provider>
  );
}

/** The hero's trigger: a solid white button, the one filled CTA on the page.
 *  The header's hairline "Get a kit" stays the quiet sibling — same family,
 *  different volume, so only one element in the frame is loud. */
export function WaitlistCta() {
  const open = useWaitlist();

  return (
    <button
      className="mt-7 inline-block rounded-[var(--radius-frame)] bg-paper px-7 py-3.5 text-[12px] leading-none font-medium tracking-[0.16em] text-ink uppercase transition-opacity hover:opacity-90 sm:text-[13px]"
      onClick={open}
      type="button"
    >
      Request a test kit
    </button>
  );
}
