/**
 * Black band closing the page.
 *
 * There is almost nothing to put here yet, so the layout leans on space
 * rather than filling the width with invented links. The wordmark anchors the
 * left, the legal line sits right on desktop and stacks under it on a phone.
 *
 * The year is fixed rather than computed. `new Date()` in a server component
 * either forces the route dynamic or bakes the build year in anyway, so it
 * would still go stale — a literal at least goes stale visibly.
 */
export function SiteFooter() {
  return (
    // Gutter on the outside of the max-width, matching the section above.
    // Padding inside it insets the content a further 32px and the footer stops
    // lining up with the page.
    <footer className="bg-ink px-5 text-paper sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 py-16 sm:flex-row sm:items-end sm:justify-between sm:py-20">
        <span className="text-[15px] leading-none font-medium tracking-[0.22em] uppercase sm:text-[16px]">
          Omen
        </span>

        <span className="text-[11px] leading-none tracking-[0.14em] text-paper/55 uppercase">
          © 2026 Omen Division, Inc.
        </span>
      </div>
    </footer>
  );
}
