"use client";

import { useWaitlist } from "./waitlist";

/**
 * Floating header over the hero. Not a bar: only the button carries a panel,
 * so the photograph runs uninterrupted edge to edge.
 *
 * Both colour choices are driven by the frame, not preference. Sampling the
 * hero behind the header gives luminance 182 on the left and 248 on the right
 * — a bright wall on one side and near-white on the other. So:
 *
 *   - The wordmark is ink, not white. White type at 182 has nothing to sit
 *     against, and it needs no panel at all once it is dark.
 *   - The button is a dark translucent chip, not a white one. A white veil
 *     over a 248 wall is invisible, which is what made the first pass read as
 *     faint. Dark also separates the button from the wordmark, so the one
 *     clickable thing up here looks clickable.
 *
 * Square corners, matching the zero-radius treatment across the site.
 */
export function SiteHeader() {
  const open = useWaitlist();

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-4 p-4 sm:p-6">
      <span className="text-[15px] leading-none font-medium tracking-[0.22em] text-ink uppercase sm:text-[16px]">
        Omen
      </span>

      <button
        // min-h-11: padding alone left this at 38px, under the 44px minimum
        // comfortable tap target on a phone.
        className="inline-flex min-h-11 items-center border border-ink/15 bg-ink/85 px-5 text-[12px] leading-none font-medium tracking-[0.16em] text-paper uppercase backdrop-blur-md transition-colors duration-200 hover:bg-ink sm:px-6 sm:text-[13px]"
        onClick={open}
        type="button"
      >
        Get a kit
      </button>
    </header>
  );
}
