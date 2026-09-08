/**
 * The footer is a rounded espresso panel sitting in the same gutter as the
 * hero frame — the page opens with a framed photograph and closes with a
 * framed dark surface, same radius, same inset. Espresso rather than --ink:
 * the panel belongs to the golden photography above it, not to the cool text
 * color.
 *
 * Links are only the ones with somewhere to go; FAQs/Privacy/Contact from the
 * design boards return when those pages exist.
 *
 * The year is a literal. `new Date()` in a server component either forces the
 * route dynamic or bakes the build year in anyway, so it would still go stale,
 * just invisibly.
 */
export function SiteFooter() {
  return (
    <footer className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="rounded-[var(--radius-frame)] bg-espresso px-6 pt-9 pb-6 sm:px-16 sm:pt-12 sm:pb-8">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="block text-[15px] leading-none font-medium tracking-[0.22em] text-paper uppercase sm:text-[16px]">
              Omen
            </span>
            <span className="mt-2.5 block text-[10px] leading-none tracking-[0.18em] text-white/55 uppercase">
              The personal genomics company
            </span>
          </div>
          <nav className="flex items-center gap-6 sm:gap-8">
            <a
              className="text-[11px] font-medium tracking-[0.16em] text-white/75 uppercase transition-colors hover:text-white"
              href="#how-it-works"
            >
              How it works
            </a>
            <a
              className="text-[11px] font-medium tracking-[0.16em] text-white/75 uppercase transition-colors hover:text-white"
              href="/gate"
            >
              Log in
            </a>
          </nav>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-white/12 pt-5 sm:mt-14 sm:pt-6">
          <span className="text-[10px] leading-none tracking-[0.14em] text-white/45 uppercase sm:text-[11px]">
            © 2026 Omen Division, Inc.
          </span>
          <span className="text-[10px] leading-none tracking-[0.14em] text-white/45 uppercase sm:text-[11px]">
            Know what works for your body
          </span>
        </div>
      </div>
    </footer>
  );
}
