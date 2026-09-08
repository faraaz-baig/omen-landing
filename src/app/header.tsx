"use client";

import { useEffect, useState } from "react";
import { useWaitlist } from "./waitlist";

/**
 * Floating header over the hero. Bare type at the top of the page, where the
 * photograph is clean behind it; panels fade in once the page scrolls and
 * content starts passing underneath.
 *
 * Padding and a transparent border are present in both states, so only colour
 * animates. Adding the border and padding on scroll instead would resize both
 * elements and jog the header sideways at the moment it appears.
 *
 * The wordmark is ink rather than white: sampling the hero behind the header
 * gives luminance 182 on the left and 248 on the right, so there is nothing
 * for white type to sit against on either side.
 */
export function SiteHeader() {
  const open = useWaitlist();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Passive: this must never block the scroll it is listening to. React
    // bails out when the boolean is unchanged, so this re-renders twice per
    // page, not once per frame.
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const panel = scrolled
    ? "border-ink/10 bg-paper/70 backdrop-blur-md"
    : "border-transparent bg-transparent";

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-4 p-4 sm:p-6">
      {/*
        A lockup, not one string. The descriptor is set smaller, lighter and on
        tighter tracking so "Omen" still reads as the mark rather than the two
        becoming one long line of evenly spaced capitals.

        It is hidden below sm: at 0.22em tracking the full lockup is wider than
        a 320px screen once the button is beside it.
      */}
      <span
        className={`flex items-baseline gap-2.5 border px-4 py-2.5 leading-none uppercase transition-colors duration-300 ${panel}`}
      >
        <span className="text-[15px] font-medium tracking-[0.22em] text-ink sm:text-[16px]">
          Omen
        </span>
        {/* A middot at descriptor size all but vanishes between two runs of
            tracked capitals. Set large enough to read as a deliberate
            separator, and nudged onto the optical centre of the cap height —
            baseline alignment would hang it low. */}
        <span
          aria-hidden
          className="hidden translate-y-[0.06em] text-[24px] leading-none text-ink/45 sm:inline"
        >
          ·
        </span>
        {/*
          Full ink, not ink-2. Over this hero ink-2 measures 3.15:1, under the
          4.5:1 small text needs, and it visibly washed out. The descriptor is
          held secondary by size, weight and tracking instead of by fading it
          into a photograph whose brightness we do not control.
        */}
        <span className="hidden text-[11px] tracking-[0.14em] text-ink sm:inline">
          The personal genomics company
        </span>
      </span>

      <button
        // min-h-11: padding alone left this at 38px, under the 44px minimum
        // comfortable tap target on a phone.
        className={`inline-flex min-h-11 items-center border px-5 text-[12px] leading-none font-medium tracking-[0.16em] uppercase transition-colors duration-300 sm:px-6 sm:text-[13px] ${
          scrolled
            ? "border-ink/15 bg-ink/90 text-paper backdrop-blur-md hover:bg-ink"
            : "border-transparent bg-transparent text-ink hover:text-ink-2"
        }`}
        onClick={open}
        type="button"
      >
        Get a kit
      </button>
    </header>
  );
}
