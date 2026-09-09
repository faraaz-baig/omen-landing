import { OmenMark } from "../../omen-mark";
import { GenomeMap } from "./genome-map";

export const metadata = { title: "heyomen.com" };

/**
 * The genome page: the dashboard header and the map, nothing else yet. The
 * header is the landing header's anatomy (three zones, lockup dead-center)
 * with dashboard options — page label left, data-source chip and account on
 * the right. Route lives behind the same gate as the rest of /preview.
 */
export default function GenomePage() {
  return (
    <main className="min-h-dvh bg-paper">
      <header className="relative flex h-14 items-center justify-between px-4 sm:h-[92px] sm:px-5">
        <span className="text-[12px] font-medium tracking-[0.16em] text-ink uppercase">
          Your genome
        </span>

        <div className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-center gap-1.5 sm:flex">
          <OmenMark className="h-6 w-auto text-ink" />
          <span className="text-[10px] leading-none tracking-[0.18em] text-ink-2 uppercase">
            The personal genomics company
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <span className="flex h-8 items-center gap-2 rounded-[var(--radius-frame)] border border-[#e7e6e4] px-3.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            <span className="text-[10px] leading-none font-medium tracking-[0.14em] text-ink uppercase">
              <span className="hidden sm:inline">23andMe file · partial read</span>
              <span className="sm:hidden">Partial read</span>
            </span>
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-[#e7e6e4] bg-[#f4f4f3] text-[11px] font-medium text-ink">
            D
          </span>
        </div>
      </header>

      <GenomeMap />
    </main>
  );
}
