"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
export interface GeneMarker {
  gene: string;
  posMb: number;
  state: "finding" | "known" | "guarded" | "locked";
  label: string | null;
  verdict: string | null;
  outcome: "verdict" | "no_call" | "not_on_chip" | "pending_pharmcat";
  genotype: string | null;
  rsid: string | null;
}

export interface ChromosomeData {
  name: string;
  lengthMb: number;
  called: number;
  markers: GeneMarker[];
}

export interface MapPayload {
  totalCalled: number;
  insightCount: number;
  chromosomes: ChromosomeData[];
  /** true when served by the omen-genomics pipeline, false on the static fallback */
  live: boolean;
}

/* Bar heights are proportional to real GRCh37 lengths. chr1 (249.25 Mb) sets
   the scale; MT (16.6 kb) would be invisible at any linear scale, so it draws
   as its true shape instead — a circle (mtDNA is circular). */
const MAX_BAR_PX = 200;
const PX_PER_MB = MAX_BAR_PX / 249.25;
const READ_TICK_MS = 90;

function barHeight(c: ChromosomeData) {
  return Math.max(40, Math.round(c.lengthMb * PX_PER_MB));
}

type Selection =
  | { kind: "chromosome"; chrom: ChromosomeData }
  | { kind: "marker"; chrom: ChromosomeData; marker: GeneMarker };

/* One dot vocabulary — states plus the honest gaps (no-call / not-on-chip
   render as faint hollow dots: hiding an unanswered question would
   overstate coverage). */
function MarkerDot({ state, outcome }: { state: GeneMarker["state"]; outcome?: GeneMarker["outcome"] }) {
  if (state === "finding")
    return <span className="h-[11px] w-[11px] rounded-full bg-ember" />;
  if (state === "locked")
    return <span className="h-2 w-2 rounded-full border-[1.5px] border-ember bg-[#f3efe9]" />;
  if (state === "guarded")
    return <span className="h-2 w-2 rounded-full border-[1.5px] border-ink/40 bg-[#f3efe9]" />;
  if (outcome && outcome !== "verdict")
    return <span className="h-2 w-2 rounded-full border-[1.5px] border-ink/25 bg-[#f3efe9]" />;
  return <span className="h-2 w-2 rounded-full bg-[rgb(28_23_19/0.8)]" />;
}

const OUTCOME_TEXT: Record<string, string> = {
  no_call: "The chip carried this position but couldn't read it in your sample — a no-call, not a variant.",
  not_on_chip: "Your chip version never carried this position.",
  pending_pharmcat: "Awaiting the PharmCAT pass for this gene.",
};

function shortVerdict(v: string) {
  const cut = v.indexOf(" — ");
  return cut > 0 ? v.slice(0, cut) : v;
}

function InfoCard({ sel, align }: { sel: Selection; align: "left" | "center" | "right" }) {
  const c = sel.chrom;
  const displayName = c.name === "MT" ? "Mitochondrial DNA" : `Chromosome ${c.name}`;
  return (
    // Phones get a bottom sheet — an anchored card clips at the screen edge
    // for all but the middle chromosomes. From sm it anchors to the bar.
    <div
      className={`fixed inset-x-3 bottom-3 z-20 rounded-[var(--radius-frame)] border border-ink/10 bg-paper p-5 text-left shadow-[0_16px_40px_-12px_rgb(26_18_12/0.35)] sm:absolute sm:inset-x-auto sm:bottom-full sm:mb-3 sm:w-[320px] ${
        align === "right" ? "sm:right-0" : align === "left" ? "sm:left-0" : "sm:left-1/2 sm:-translate-x-1/2"
      }`}
    >
      {sel.kind === "chromosome" ? (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[15px] leading-5 font-medium text-ink">{displayName}</p>
            <p className="font-mono text-[11px] text-ink-2">
              {c.markers.length > 0
                ? `${c.markers.length} ${c.markers.length === 1 ? "insight" : "insights"}`
                : "no curated insights yet"}
            </p>
          </div>
          <p className="mt-1.5 text-[12px] leading-4 text-ink-2">
            {c.called.toLocaleString()} positions read on this chromosome
          </p>
          {c.markers.length > 0 ? (
            <div className="mt-2">
              {c.markers.map((m) => (
                <p className="flex items-center gap-2.5 border-t border-[#e7e6e4] py-2" key={m.gene}>
                  <MarkerDot outcome={m.outcome} state={m.state} />
                  <span
                    className={`text-[13px] leading-[18px] ${m.state === "locked" || m.state === "guarded" || m.outcome !== "verdict" ? "text-ink-2" : "text-ink"}`}
                  >
                    {m.verdict ? shortVerdict(m.verdict) : `${m.gene} — ${m.outcome.replace(/_/g, "-")}`}
                  </span>
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[13px] leading-5 text-ink-2">
              No curated markers here yet — this data still powers ancestry-scale results.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[13px] text-ink">
              {sel.marker.gene}
              {sel.marker.genotype && ` · ${sel.marker.genotype}`}
            </p>
            {sel.marker.state === "finding" && (
              <span className="rounded-[4px] bg-muted px-2 py-1 text-[9px] leading-none font-medium tracking-[0.14em] text-ink uppercase">
                CPIC Level A
              </span>
            )}
            {sel.marker.state === "locked" && (
              <span className="rounded-[4px] border border-ember/40 px-2 py-1 text-[9px] leading-none font-medium tracking-[0.14em] text-ember uppercase">
                Requires sequencing
              </span>
            )}
            {sel.marker.state === "guarded" && (
              <span className="rounded-[4px] border border-ink/25 px-2 py-1 text-[9px] leading-none font-medium tracking-[0.14em] text-ink-2 uppercase">
                On request
              </span>
            )}
          </div>
          <p className="mt-2.5 text-[14px] leading-[21px] text-ink">
            {sel.marker.verdict ?? OUTCOME_TEXT[sel.marker.outcome] ?? sel.marker.outcome}
          </p>
          {sel.marker.rsid && (
            <p className="mt-2 font-mono text-[11px] text-ink-2">
              {sel.marker.rsid} · chr{c.name} · read from your file
            </p>
          )}
          <p className="mt-3">
            {sel.marker.state === "locked" ? (
              <Link
                className="text-[11px] font-medium tracking-[0.16em] text-ink uppercase transition-colors hover:text-ink-2"
                href="/"
              >
                Get the kit →
              </Link>
            ) : sel.marker.state === "guarded" ? (
              <span className="text-[11px] font-medium tracking-[0.16em] text-ink-2 uppercase">
                Ask Omen when you&rsquo;re ready
              </span>
            ) : (
              <Link
                className="text-[11px] font-medium tracking-[0.16em] text-ink uppercase transition-colors hover:text-ink-2"
                href="/preview"
              >
                Ask Omen about this →
              </Link>
            )}
          </p>
        </>
      )}
    </div>
  );
}

function Chromosome({
  c,
  index,
  readIndex,
  dimmed,
  selected,
  onHover,
  onSelect,
}: {
  c: ChromosomeData;
  index: number;
  readIndex: number;
  dimmed: boolean;
  selected: Selection | null;
  onHover: (index: number | null) => void;
  onSelect: (sel: Selection | null) => void;
}) {
  const state = index < readIndex ? "read" : index === readIndex ? "reading" : "pending";
  const isSelected = selected !== null && selected.chrom.name === c.name;
  const align = index > 18 ? "right" : index < 3 ? "left" : "center";
  const label = c.markers.find((m) => m.label)?.label;
  const hasFinding = c.markers.some((m) => m.state === "finding");

  return (
    <div
      className={`relative flex flex-col items-center gap-2 transition-opacity duration-200 ${
        dimmed && !isSelected ? "opacity-40" : "opacity-100"
      }`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {isSelected && <InfoCard align={align} sel={selected} />}

      <span
        className={`flex h-[13px] items-center text-[8px] tracking-[0.08em] uppercase ${
          hasFinding ? "font-medium text-ember" : "text-ink-2"
        } ${state === "read" ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      >
        {label ?? ""}
      </span>

      <button
        aria-label={`Chromosome ${c.name} — ${c.markers.length} insights, ${c.called.toLocaleString()} positions read`}
        className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
        onClick={() =>
          onSelect(isSelected && selected.kind === "chromosome" ? null : { kind: "chromosome", chrom: c })
        }
        type="button"
      >
        {c.name === "MT" ? (
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300 ${
              state === "pending" ? "border border-dashed border-ink/25" : "bg-[#e2dacb]"
            }`}
          />
        ) : (
          <span
            className={`relative block w-6 rounded-full transition-colors duration-300 ${
              state === "pending"
                ? "border border-dashed border-ink/25 bg-transparent"
                : state === "reading"
                  ? "border-[1.5px] border-ink/50 bg-[#eae3d6]"
                  : `bg-[#e2dacb] ${hasFinding ? "border-[1.5px] border-ember" : ""} ${
                      isSelected && !hasFinding ? "ring-[1.5px] ring-ink" : ""
                    }`
            }`}
            style={{ height: barHeight(c) }}
          />
        )}
      </button>

      {/* Marker buttons overlay the bar as siblings, not children — a button
          inside a button is invalid HTML and breaks assistive tech. Top offset
          = label row (13px) + gap (8px) + position within the bar. */}
      {state === "read" &&
        c.markers.map((m) => (
          <button
            aria-label={`${m.gene} — ${m.verdict ? shortVerdict(m.verdict) : m.outcome.replace(/_/g, "-")}`}
            className="absolute left-1/2 z-[5] flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center p-[3px] transition-transform hover:scale-125"
            key={m.gene}
            onClick={() =>
              onSelect(
                isSelected && selected.kind === "marker" && selected.marker.gene === m.gene
                  ? null
                  : { kind: "marker", chrom: c, marker: m },
              )
            }
            style={{
              top:
                c.name === "MT"
                  ? 33
                  : 21 +
                    Math.min(0.94, Math.max(0.06, m.posMb / c.lengthMb)) * barHeight(c),
            }}
            type="button"
          >
            <MarkerDot outcome={m.outcome} state={m.state} />
          </button>
        ))}

      <span
        className={`text-[9px] tracking-[0.1em] ${
          hasFinding && state === "read" ? "font-medium text-ember" : "text-ink-2"
        }`}
      >
        {c.name}
      </span>
    </div>
  );
}

export function GenomeMap({ data }: { data: MapPayload }) {
  /* readIndex sweeps across the chromosomes on mount: the file "reads in" one
     chromosome at a time, dots landing as each finishes. Reduced-motion jumps
     straight to done. */
  const [readIndex, setReadIndex] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const doneRef = useRef(false);

  const CHROMOSOMES = data.chromosomes;
  const total = CHROMOSOMES.length;
  const reading = readIndex < total;

  useEffect(() => {
    if (doneRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReadIndex(total);
      doneRef.current = true;
      return;
    }
    const timer = setInterval(() => {
      setReadIndex((i) => {
        if (i + 1 >= total) {
          clearInterval(timer);
          doneRef.current = true;
        }
        return i + 1;
      });
    }, READ_TICK_MS);
    return () => clearInterval(timer);
  }, [total]);

  const readSoFar = CHROMOSOMES.slice(0, readIndex).reduce((n, c) => n + c.called, 0);

  return (
    <section className="px-3 sm:px-5">
      <div className="relative rounded-[var(--radius-frame)] bg-[#f3efe9] px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-[11px] font-medium tracking-[0.16em] text-ink-2 uppercase">
            Digvijay&rsquo;s genome · {data.insightCount} things read from your file
          </h1>
          <p aria-live="polite" className="text-right text-[11px] tracking-[0.14em] text-ink-2 uppercase">
            {reading
              ? `Reading chromosome ${CHROMOSOMES[readIndex]?.name}… · ${readSoFar.toLocaleString()} positions`
              : `${data.totalCalled.toLocaleString()} positions · 23andMe chip v5${data.live ? ' · live' : ''}`}
          </p>
        </div>

        {(selected || showHelp) && (
          <button
            aria-label="Close details"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => {
              setSelected(null);
              setShowHelp(false);
            }}
            type="button"
          />
        )}

        <div className="mt-7 flex flex-wrap items-end justify-center gap-x-3 gap-y-8 sm:mt-9 sm:gap-x-[26px]">
          {CHROMOSOMES.map((c, i) => (
            <Chromosome
              c={c}
              dimmed={hovered !== null && hovered !== i}
              index={i}
              key={c.name}
              onHover={(h) => setHovered(h)}
              onSelect={setSelected}
              readIndex={readIndex}
              selected={selected}
            />
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2">
              <span className="h-[11px] w-[11px] rounded-full bg-ember" />
              <span className="text-[11px] tracking-[0.1em] text-ink uppercase">Worth acting on</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[rgb(28_23_19/0.8)]" />
              <span className="text-[11px] tracking-[0.1em] text-ink-2 uppercase">Something we know about you</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full border-[1.5px] border-ink/40" />
              <span className="text-[11px] tracking-[0.1em] text-ink-2 uppercase">Opens on request</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full border-[1.5px] border-ember" />
              <span className="text-[11px] tracking-[0.1em] text-ink-2 uppercase">Readable only by sequencing</span>
            </span>
          </div>
          <span className="relative">
            <button
              className="flex cursor-pointer items-center gap-2 text-ink-2 transition-colors hover:text-ink"
              onClick={() => setShowHelp((s) => !s)}
              type="button"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full border border-ink/25 text-[11px] font-medium">
                ?
              </span>
              <span className="text-[11px] tracking-[0.1em] uppercase">How to read this map</span>
            </button>
            {showHelp && (
              <span className="absolute right-0 bottom-full z-20 mb-3 block w-[340px] rounded-[var(--radius-frame)] border border-ink/10 bg-paper p-5 text-left shadow-[0_16px_40px_-12px_rgb(26_18_12/0.35)]">
                <span className="block text-[13px] leading-5 text-ink">
                  These are your 23 chromosome pairs plus mitochondrial DNA, drawn to their real
                  lengths. Each dot is a spot in your file where the science is solid enough to say
                  something in plain English.
                </span>
                <span className="mt-2.5 block text-[13px] leading-5 text-ink-2">
                  A chip reads about 0.02% of your genome — {data.totalCalled.toLocaleString()} chosen
                  positions. That covers most common insights; hollow ember dots mark genes that
                  genuinely need full sequencing.
                </span>
              </span>
            )}
          </span>
        </div>
      </div>
    </section>
  );
}
