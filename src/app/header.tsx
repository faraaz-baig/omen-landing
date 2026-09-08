"use client";

import { useWaitlist } from "./waitlist";

/**
 * In-flow header above the hero frame, on paper. It used to float fixed over
 * the photograph with a scroll-triggered frosted panel; both went away when
 * the hero became an inset box with the header sitting above it — there is
 * nothing behind the header to frost any more, and it scrolls with the page.
 *
 * Horizontal padding matches the hero frame's gutter (px-3 / sm:px-5) so the
 * wordmark and button align with the box edges below, and the vertical
 * padding repeats the same values so the header band reads as part of the
 * same frame.
 */
export function SiteHeader() {
  const open = useWaitlist();

  return (
    <header className="flex items-center justify-between gap-4 px-3 py-3 sm:px-5 sm:py-5">
      {/*
        A lockup, not one string. The descriptor is set smaller, lighter and on
        tighter tracking so "Omen" still reads as the mark rather than the two
        becoming one long line of evenly spaced capitals.

        It is hidden below sm: at 0.22em tracking the full lockup is wider than
        a 320px screen once the button is beside it.
      */}
      <span
        // No panel padding or ghost border: those were sized for the frosted
        // panel this used to sit in over the photo. Bare type on paper needs
        // neither, and the wordmark now starts flush at the header's gutter,
        // aligned with the banner edge below it.
        className="flex items-baseline gap-2.5 leading-none uppercase"
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
        // Below the 44px comfortable tap target, accepted for how light this
        // header runs; the bare lockup no longer dictates a height to match.
        //
        // Hairline border, ink on hover: on paper the button no longer has a
        // photograph to sit against, so it takes the site's bordered-panel
        // treatment instead of the transparent-then-frosted overlay states.
        className="inline-flex h-[37px] items-center rounded-[var(--radius-frame)] border border-ink/15 bg-transparent px-5 text-[12px] leading-none font-medium tracking-[0.16em] text-ink uppercase transition-colors duration-300 hover:bg-ink hover:text-paper sm:h-[38px] sm:px-6 sm:text-[13px]"
        onClick={open}
        type="button"
      >
        Get a kit
      </button>
    </header>
  );
}
