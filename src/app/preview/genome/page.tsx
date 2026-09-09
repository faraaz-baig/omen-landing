import { OmenMark } from "../../omen-mark";
import { GenomeMap, type MapPayload } from "./genome-map";
import { CHROMOSOMES, INSIGHT_COUNT, TOTAL_CALLED } from "./genome-data";

export const metadata = { title: "heyomen.com" };
export const dynamic = "force-dynamic";

/**
 * The genome page: the dashboard header and the map. The map payload comes
 * from the omen-genomics pipeline when it's reachable (server-side fetch —
 * the admin token never leaves this process); otherwise the committed static
 * snapshot serves, so the deployed site keeps working until the Contabo box
 * hosts the API.
 */
async function loadPayload(): Promise<MapPayload> {
  const base = process.env.GENOMICS_API_URL;
  const token = process.env.GENOMICS_ADMIN_TOKEN;
  if (base && token) {
    try {
      const headers = { authorization: `Bearer ${token}` };
      const files = (await (
        await fetch(`${base}/api/files`, { headers, cache: "no-store" })
      ).json()) as { files: { _id: string; status: string }[] };
      const latest = files.files.find((f) => f.status === "interpreted");
      if (latest) {
        const genome = await (
          await fetch(`${base}/api/files/${latest._id}/genome`, { headers, cache: "no-store" })
        ).json();
        return { ...(genome as Omit<MapPayload, "live">), live: true };
      }
    } catch {
      // fall through to the static snapshot
    }
  }
  return {
    totalCalled: TOTAL_CALLED,
    insightCount: INSIGHT_COUNT,
    live: false,
    chromosomes: CHROMOSOMES.map((c) => ({
      name: c.name,
      lengthMb: c.lengthMb,
      called: c.called,
      markers: c.markers.map((m) => ({ ...m, outcome: "verdict" as const })),
    })),
  };
}

export default async function GenomePage() {
  const data = await loadPayload();
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

      <GenomeMap data={data} />
    </main>
  );
}
