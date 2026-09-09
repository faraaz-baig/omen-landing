// Builds the genome map's data module from a 23andMe raw file.
//
//   node scripts/build-genome-map.mjs "/path/to/genome.txt"
//
// v2: the map shows insights, not coverage. Each marker below is a curated
// locus; where an rsid is given, the verdict is derived from the genotype
// actually present in the file (plus-strand, GRCh37) — the generator fails
// loudly on a genotype it has no interpretation for, rather than guessing.
// Markers without an rsid carry verdicts from the PharmCAT run on this same
// file (star-allele calls a single rsid can't express).
import { readFileSync, writeFileSync } from "node:fs";

// GRCh37 chromosome lengths in Mb — constants, not measurements.
const LENGTHS = {
  1: 249.25, 2: 243.2, 3: 198.02, 4: 191.15, 5: 180.92, 6: 171.12,
  7: 159.14, 8: 146.36, 9: 141.21, 10: 135.53, 11: 135.01, 12: 133.85,
  13: 115.17, 14: 107.35, 15: 102.53, 16: 90.35, 17: 81.2, 18: 78.08,
  19: 59.13, 20: 63.03, 21: 48.13, 22: 51.3, X: 155.27, Y: 59.37, MT: 0.0166,
};

// label: the always-on caption above the bar (first labeled marker wins).
// verdicts: genotype → plain-English one-liner. Missing genotype = build error.
const DEFS = [
  { chrom: "1", gene: "MTHFR", posMb: 11.86, rsid: "rs1801133", label: "Folate", verdicts: {
    GG: "Folate: you process it normally — no special supplementation story.",
    AG: "Folate: one reduced-activity MTHFR copy — mildly slower processing.",
    AA: "Folate: both MTHFR copies reduced — worth discussing methylfolate." } },
  { chrom: "2", gene: "MCM6/LCT", posMb: 136.61, rsid: "rs4988235", label: "Lactose", verdicts: {
    GG: "Lactose: your lactase likely switched off after childhood — most dairy will bother you.",
    AG: "Lactose: one persistence copy — dairy is likely fine.",
    AA: "Lactose: fully lactase-persistent — dairy is fine." } },
  { chrom: "2", gene: "UGT1A1", posMb: 234.67, rsid: "rs887829", verdicts: {
    CC: "Bilirubin: standard processing — no Gilbert's-syndrome tendency here.",
    CT: "Bilirubin: one slow UGT1A1 copy — occasional mild jaundice is benign.",
    TT: "Bilirubin: Gilbert's-syndrome pattern — harmless, worth knowing before lab tests." } },
  { chrom: "4", gene: "GC", posMb: 72.61, rsid: "rs2282679", label: "Vitamin D", verdicts: {
    TT: "Vitamin D: typical binding-protein levels — supplement by lifestyle, not genetics.",
    GT: "Vitamin D: one lower-level GC copy — you may run a little low.",
    GG: "Vitamin D: genetically lower levels — testing and supplementing likely worth it." } },
  { chrom: "4", gene: "ADH1B", posMb: 100.24, rsid: "rs1229984", verdicts: {
    CC: "Alcohol: standard first-step metabolism.",
    CT: "Alcohol: one fast ADH1B copy — acetaldehyde builds quicker.",
    TT: "Alcohol: fast metabolizer — drinks hit harder, sooner." } },
  { chrom: "6", gene: "TPMT", posMb: 18.13, verdict:
    "Thiopurine medications: standard dosing (TPMT *1/*1)." },
  { chrom: "6", gene: "HFE", posMb: 26.09, rsid: "rs1800562", label: "Iron", verdicts: {
    GG: "Iron: no C282Y hemochromatosis variant — the main overload flag is clear.",
    AG: "Iron: one C282Y copy — carrier, rarely a problem alone.",
    AA: "Iron: two C282Y copies — hereditary hemochromatosis risk, see a doctor." } },
  { chrom: "6", gene: "HLA-A", posMb: 29.91, state: "locked", verdict:
    "Severe drug-reaction alleles — chips can't type HLA; sequencing can." },
  { chrom: "6", gene: "HLA-B", posMb: 31.32, state: "locked", verdict:
    "Severe drug-reaction alleles (abacavir, carbamazepine) — needs sequencing." },
  { chrom: "7", gene: "CYP3A5", posMb: 99.27, verdict:
    "A few transplant medications: standard dosing (CYP3A5 non-expresser — most people are)." },
  { chrom: "7", gene: "TAS2R38", posMb: 141.67, rsid: "rs713598", label: "Taste", verdicts: {
    CC: "Bitter taste: strong taster — brassicas and tonic water really are worse for you.",
    CG: "Bitter taste: partial taster.",
    GG: "Bitter taste: non-taster — kale is easy mode." } },
  { chrom: "8", gene: "NAT2", posMb: 18.26, verdict:
    "Slow acetylator (NAT2) — matters for a few older drugs like isoniazid." },
  { chrom: "10", gene: "CYP2C19", posMb: 96.52, state: "finding", label: "Meds", verdict:
    "Intermediate metabolizer (*1/*2) — you clear escitalopram, citalopram and omeprazole slower than most. CPIC Level A." },
  { chrom: "10", gene: "CYP2C9", posMb: 96.7, verdict:
    "Ibuprofen and warfarin: standard metabolism (CYP2C9 *1/*1)." },
  { chrom: "11", gene: "FADS1", posMb: 61.55, rsid: "rs174537", verdicts: {
    GG: "Omega-3: efficient converter of plant sources.",
    GT: "Omega-3: intermediate conversion — fish or algae sources work better than flax.",
    TT: "Omega-3: low conversion — get EPA/DHA directly, not from flaxseed." } },
  { chrom: "11", gene: "ACTN3", posMb: 66.33, rsid: "rs1815739", label: "Muscle", verdicts: {
    CC: "Muscle type: two working sprint copies — power-leaning.",
    CT: "Muscle type: one sprint copy, one endurance — the versatile middle.",
    TT: "Muscle type: endurance-leaning — the sprint protein is absent." } },
  { chrom: "12", gene: "SLCO1B1", posMb: 21.33, label: "Statins", verdict:
    "Statins: no elevated muscle-pain risk — standard dosing if you ever need one." },
  { chrom: "12", gene: "ALDH2", posMb: 112.24, rsid: "rs671", verdicts: {
    GG: "Alcohol flush: no ALDH2 variant — you don't go red.",
    AG: "Alcohol flush: one slow copy — you flush, and drinking carries extra risk.",
    AA: "Alcohol flush: strong reaction — alcohol is genuinely worse for you." } },
  { chrom: "15", gene: "CYP1A2", posMb: 75.04, rsid: "rs762551", label: "Caffeine", verdicts: {
    AA: "Caffeine: fast metabolizer — it clears quickly.",
    AC: "Caffeine: intermediate metabolizer — an afternoon cup lingers.",
    CC: "Caffeine: slow metabolizer — that 4pm espresso is still working at midnight." } },
  { chrom: "16", gene: "VKORC1", posMb: 31.11, verdict:
    "Warfarin sensitivity: standard (VKORC1 reference)." },
  { chrom: "16", gene: "MC1R", posMb: 89.99, rsid: "rs1805007", label: "Sun", verdicts: {
    CC: "Sun: no red-hair-variant at R151C — typical burn risk from this gene.",
    CT: "Sun: one MC1R variant — you burn a little easier than average.",
    TT: "Sun: two MC1R variants — high burn sensitivity, SPF is non-negotiable." } },
  { chrom: "19", gene: "CYP4F2", posMb: 15.99, rsid: "rs2108622", verdicts: {
    CC: "Warfarin fine-tuning: standard dose gene.",
    CT: "Warfarin fine-tuning: one variant copy — you'd likely need a slightly higher dose.",
    TT: "Warfarin fine-tuning: higher dose requirement likely." } },
  { chrom: "19", gene: "RYR1", posMb: 38.98, verdict:
    "Anesthesia: no malignant-hyperthermia flags at the positions read (RYR1 reference)." },
  { chrom: "19", gene: "APOE", posMb: 45.41, state: "guarded", label: "B12 · APOE", verdict:
    "APOE affects Alzheimer's and heart risk. We read it, but don't show it unless you ask." },
  { chrom: "19", gene: "FUT2", posMb: 49.21, rsid: "rs601338", verdicts: {
    GG: "B12: secretor type — standard absorption.",
    AG: "B12: one non-secretor copy — slightly higher B12, slightly less norovirus-prone.",
    AA: "B12: non-secretor — naturally higher B12, and resistant to the most common stomach bug." } },
  { chrom: "22", gene: "ADORA2A", posMb: 24.84, rsid: "rs5751876", verdicts: {
    CC: "Caffeine sensitivity: low — jitters are rare for you.",
    CT: "Caffeine sensitivity: moderate.",
    TT: "Caffeine sensitivity: high — the receptor side of why coffee hits you hard." } },
  { chrom: "22", gene: "CYP2D6", posMb: 42.52, state: "locked", verdict:
    "Shapes 1 in 4 antidepressants and codeine — chips can't count gene copies; sequencing can." },
  { chrom: "X", gene: "G6PD", posMb: 153.76, verdict:
    "G6PD: normal variant (B) — no hemolysis flags for the drugs it gates." },
  { chrom: "MT", gene: "MT-RNR1", posMb: 0.001, state: "locked", verdict:
    "Aminoglycoside-antibiotic hearing risk — needs full mitochondrial sequencing." },
];

const file = process.argv[2];
if (!file) throw new Error("usage: node scripts/build-genome-map.mjs <23andme.txt>");

const genotypes = new Map();
const called = {};
let totalCalled = 0;
for (const line of readFileSync(file, "utf8").split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const [rsid, chrom, , genotype] = line.trim().split("\t");
  if (!LENGTHS[chrom] || genotype === "--") continue;
  genotypes.set(rsid, genotype);
  called[chrom] = (called[chrom] ?? 0) + 1;
  totalCalled++;
}

const markers = DEFS.map((d) => {
  const state = d.state ?? "known";
  let verdict = d.verdict;
  let genotype;
  if (d.rsid) {
    genotype = genotypes.get(d.rsid);
    if (!genotype) throw new Error(`${d.rsid} (${d.gene}) not called in this file`);
    const sorted = genotype.split("").sort().join("");
    verdict = d.verdicts[genotype] ?? d.verdicts[sorted];
    if (!verdict) throw new Error(`${d.rsid} (${d.gene}): no interpretation for ${genotype}`);
  }
  return { chrom: d.chrom, gene: d.gene, posMb: d.posMb, state, label: d.label ?? null, verdict, genotype: genotype ?? null, rsid: d.rsid ?? null };
});

const chromosomes = Object.keys(LENGTHS).map((name) => ({
  name,
  lengthMb: LENGTHS[name],
  called: called[name] ?? 0,
  markers: markers.filter((m) => m.chrom === name).map(({ chrom, ...m }) => m),
}));

const insightCount = markers.filter((m) => m.state !== "locked").length;

const ts = `// Generated by scripts/build-genome-map.mjs — do not edit by hand.
// Verdicts with a genotype are derived from the actual 23andMe file;
// verdicts without one come from the PharmCAT run on the same file.
// Chromosome lengths and gene loci are GRCh37 constants.

export type MarkerState = "finding" | "known" | "guarded" | "locked";

export interface GeneMarker {
  gene: string;
  posMb: number;
  state: MarkerState;
  label: string | null;
  verdict: string;
  genotype: string | null;
  rsid: string | null;
}

export interface ChromosomeData {
  name: string;
  lengthMb: number;
  called: number;
  markers: GeneMarker[];
}

export const TOTAL_CALLED = ${totalCalled};
export const INSIGHT_COUNT = ${insightCount};

export const CHROMOSOMES: ChromosomeData[] = ${JSON.stringify(chromosomes, null, 2)};
`;

writeFileSync(new URL("../src/app/preview/genome/genome-data.ts", import.meta.url), ts);
console.log(`total called: ${totalCalled.toLocaleString()} · insights: ${insightCount}`);
for (const m of markers.filter((m) => m.rsid)) console.log(`  ${m.gene} ${m.rsid} ${m.genotype}`);
