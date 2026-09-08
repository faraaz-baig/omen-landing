/**
 * Black band closing the page, following Calvin Klein's footer arrangement:
 * everything stacked on the left margin rather than split across the width,
 * the mark set large at the top, and the legal line small and grey beneath it.
 *
 * The legal line is sentence case, not the tracked uppercase used elsewhere on
 * the site. CK sets its own legal row that way, and at this size uppercase
 * with letter-spacing reads as a label rather than as fine print.
 *
 * The year is a literal. `new Date()` in a server component either forces the
 * route dynamic or bakes the build year in anyway, so it would still go stale,
 * just invisibly.
 */
export function SiteFooter() {
  return (
    // Gutter outside the max-width, matching the section above. Padding inside
    // it insets the content a further 32px and the footer stops lining up.
    <footer className="bg-ink px-5 text-paper sm:px-8">
      <div className="mx-auto max-w-6xl py-16 sm:py-20">
        <span className="block text-[26px] leading-none font-medium tracking-[0.22em] uppercase sm:text-[30px]">
          Omen
        </span>

        <p className="mt-8 text-[13px] leading-6 text-paper/50 sm:text-[14px]">
          Copyright © 2026 Omen Division, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
