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

  // Blur only, no white fill: the panel frosts whatever is passing beneath it
  // rather than covering it. Over the hero that reads as glass; once the page
  // reaches the white section there is nothing to frost and it disappears,
  // which is the right behaviour — the ink type needs no help on paper.
  const panel = scrolled
    ? "border-ink/10 bg-transparent backdrop-blur-lg"
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
        // Asymmetric padding, deliberately. Centring the line box leaves the
        // caps high, because the box reserves descender depth that uppercase
        // type never uses. Measuring the inked cap height against the panel
        // centre put it 0.6px high, so 0.6px moves from the bottom padding to
        // the top: the ink centres and the panel height is unchanged.
        className={`flex items-baseline gap-2.5 border px-4 pt-[10.6px] pb-[9.4px] leading-none uppercase transition-colors duration-300 ${panel}`}
      >
        <span className="text-[15px] font-medium tracking-[0.22em] text-ink sm:text-[16px]">
          Omen
        </span>
        {/* A middot at descriptor size all but vanishes between two runs of
            tracked capitals, so it is set much larger. leading-[0] collapses
            its line box: at 24px it is otherwise taller than the type beside
            it, and under items-baseline that surplus lands above the shared
            baseline and pushes the whole lockup 3px below its panel centre.

            No nudge. The glyph's ink runs from 7.08px to 4.44px above the
            baseline, centring it 5.76px up, while OMEN's caps centre 5.88px
            up — a 0.12px difference. It is already on the cap-height centre. */}
        <span
          aria-hidden
          className="hidden text-[24px] leading-[0] text-ink/45 sm:inline"
        >
          ·
        </span>
        {/*
          Full ink, not ink-2. Over this hero ink-2 measures 3.15:1, under the
          4.5:1 small text needs, and it visibly washed out. The descriptor is
          held secondary by size, weight and tracking instead of by fading it
          into a photograph whose brightness we do not control.
        */}
        {/*
          Lifted 1.75px. The row is baseline-aligned, which is right for the
          horizontal rhythm but means the descriptor's shorter caps centre
          lower than the wordmark's: measured 1.75px below it, and below the
          panel centre with it. The shift aligns the two cap-height centres
          without breaking the shared baseline for the rest of the row.

          A px value, not em: the descriptor is 11px at every width it is
          visible at, and the wordmark it aligns to is 16px there.
        */}
        <span className="hidden -translate-y-[1.75px] text-[11px] tracking-[0.14em] text-ink sm:inline">
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
