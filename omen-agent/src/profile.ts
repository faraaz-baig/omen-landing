/**
 * Read access to the pharmacogenomic profile the pipeline produced.
 *
 * The profile is computed once per upload by the pipeline service and is
 * immutable for a given (file, pipeline, corpus) triple. Tools read it; nothing
 * here re-derives genotypes. That is what keeps answers consistent across turns
 * — an agent that recomputed diplotypes per question could contradict itself
 * between turn 1 and turn 6, which for drug guidance is disqualifying.
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

/**
 * v1 is single-user. The owner is pinned by configuration, never taken from
 * model input — a tool that accepted a user id as a parameter would let the
 * model (or a prompt injection) read someone else's genome. When auth lands,
 * this resolves from the session principal instead.
 */
const OWNER_EMAIL = process.env.OMEN_OWNER_EMAIL ?? "owner@local";

export type Callability = "callable" | "partial" | "uncallable";

export type DiplotypeCall = {
  gene: string;
  diplotype: string | null;
  phenotype: string | null;
  activityScore: number | null;
  callability: Callability;
  note: string | null;
};

export type UncallableGene = {
  gene: string;
  callability: Exclude<Callability, "callable">;
  reason: string;
  remedy: string;
};

export type DrugRecommendation = {
  drug: string;
  genes: string[];
  source: string;
  recommendation: string;
  implications: string[];
  strength: string | null;
  population: string | null;
  matchedDiplotype: string | null;
  guidelineVersion: string | null;
  url: string | null;
  pmids: string[];
  warnings: string[];
};

export type Qc = {
  totalRows: number;
  noCallCount: number;
  noCallRate: number;
  indelCount: number;
  inferredSex: string;
};

export type Profile = {
  id: string;
  pharmcatVersion: string | null;
  cpicVersion: string | null;
  pipelineVersion: string;
  corpusVersion: string;
  diplotypes: DiplotypeCall[];
  recommendations: DrugRecommendation[];
  uncallable: UncallableGene[];
  qc: Qc;
  completedAt: string | null;
};

let cached: Profile | null = null;

/** The active profile for the pinned owner. Cached per process; it is immutable. */
export async function getProfile(): Promise<Profile> {
  if (cached) return cached;

  const rows = (await sql`
    select p.id, p.pharmcat_version, p.cpic_version, p.pipeline_version,
           p.corpus_version, p.diplotypes, p.recommendations, p.uncallable,
           p.qc, p.completed_at
    from pgx_profile_current c
    join pgx_profiles p on p.id = c.profile_id
    join users u on u.id = c.user_id
    where u.email = ${OWNER_EMAIL} and p.status = 'complete'
    limit 1
  `) as any[];

  const r = rows[0];
  if (!r) {
    throw new Error(
      `No completed pgx_profile for ${OWNER_EMAIL}. Run the pipeline first.`,
    );
  }

  cached = {
    id: r.id,
    pharmcatVersion: r.pharmcat_version,
    cpicVersion: r.cpic_version,
    pipelineVersion: r.pipeline_version,
    corpusVersion: r.corpus_version,
    diplotypes: r.diplotypes ?? [],
    recommendations: r.recommendations ?? [],
    uncallable: r.uncallable ?? [],
    qc: r.qc ?? {},
    completedAt: r.completed_at,
  };
  return cached;
}

/** Provenance stamped onto every tool result, so no claim is uncited. */
export async function provenance() {
  const p = await getProfile();
  return {
    profileId: p.id,
    pharmcatVersion: p.pharmcatVersion,
    cpicDataVersion: p.cpicVersion,
    pipelineVersion: p.pipelineVersion,
    corpusVersion: p.corpusVersion,
    // User-facing label. The underlying array is deliberately unnamed — see the
    // "never name the testing provider" rule in agent/instructions.md.
    dataSource: "Omen DNA file (GRCh37)",
  };
}

/**
 * Whether a position is on the array at all, and what the sample's genotype was.
 *
 * Three states, deliberately distinct: `not_on_chip` (never measurable),
 * `no_call` (measurable, but this sample failed), and `called`. Collapsing the
 * first two into "reference" is the single most common way consumer
 * pharmacogenomic interpretation goes confidently wrong.
 */
export async function lookupChipPosition(rsid: string) {
  const rows = (await sql`
    select rsid, chrom, pos_b37
    from chip_positions
    where rsid = ${rsid}
      and array_source = '23andme' and array_version = 'v5'
    limit 1
  `) as any[];

  const hit = rows[0];
  if (!hit) {
    return {
      rsid,
      state: "not_on_chip" as const,
      explanation:
        "This position is not present in this Omen DNA file. It was never " +
        "measured — this is not the same as being reference/wild-type.",
    };
  }
  return {
    rsid,
    state: "on_chip" as const,
    chrom: hit.chrom,
    positionGRCh37: hit.pos_b37,
    explanation: "This position is measured in this Omen DNA file.",
  };
}

export type GenotypeState = {
  rsid: string;
  /** called | no_call | not_on_chip */
  state: "called" | "no_call" | "not_on_chip";
  genotype: string | null;
  chrom: string | null;
  positionGRCh37: number | null;
  explanation: string;
};

/**
 * The personal join. Given rsIDs found in public literature, report which the
 * user actually carries.
 *
 * This is the only place a public finding becomes a personal one, and the only
 * place the three states are distinguished. An external tool saying "rs7903146
 * is associated with T2D" says nothing about this person until it passes
 * through here.
 */
export async function getMyGenotypes(rsids: string[]): Promise<GenotypeState[]> {
  if (rsids.length === 0) return [];
  const ids = rsids.map((r) => r.toLowerCase().trim()).filter((r) => /^rs\d+$/.test(r));
  if (ids.length === 0) return [];

  const called = (await sql`
    select rsid, genotype, chrom, pos_b37, call_class
    from user_genotypes
    where rsid = any(${ids})
  `) as any[];
  const byRsid = new Map(called.map((r) => [r.rsid, r]));

  const onChip = (await sql`
    select rsid from chip_positions
    where rsid = any(${ids})
      and array_source = '23andme' and array_version = 'v5'
  `) as any[];
  const chipSet = new Set(onChip.map((r) => r.rsid));

  return ids.map((rsid) => {
    const row = byRsid.get(rsid);
    if (!row) {
      return {
        rsid,
        state: chipSet.has(rsid) ? ("no_call" as const) : ("not_on_chip" as const),
        genotype: null,
        chrom: null,
        positionGRCh37: null,
        explanation: chipSet.has(rsid)
          ? "In the file, but this sample produced no genotype at this position."
          : "Not present in this Omen DNA file — never measured. This is NOT " +
            "the same as being reference/wild-type.",
      };
    }
    const isNoCall = row.call_class === "no_call";
    return {
      rsid,
      state: isNoCall ? ("no_call" as const) : ("called" as const),
      genotype: row.genotype,
      chrom: row.chrom,
      positionGRCh37: row.pos_b37,
      explanation: isNoCall
        ? "Measured, but the genotype call failed."
        : row.call_class === "indel"
          ? `Reported as "${row.genotype}", an insertion/deletion code that cannot ` +
            "be resolved to specific bases without reference context."
          : `Genotype ${row.genotype}.`,
    };
  });
}

/** Which PGx genes require this position, per PharmCAT. */
export async function genesRequiringPosition(rsid: string) {
  const rows = (await sql`
    select distinct gene from pgx_gene_positions where rsid = ${rsid}
  `) as any[];
  return rows.map((r) => r.gene as string);
}

/** Coverage for a gene: required positions vs. positions the array carries. */
export async function geneCoverage(gene: string) {
  const rows = (await sql`
    select count(*)::int as required,
           count(c.rsid)::int as on_chip
    from pgx_gene_positions g
    left join chip_positions c
      on c.rsid = g.rsid
     and c.array_source = '23andme' and c.array_version = 'v5'
    where g.gene = ${gene}
  `) as any[];
  const r = rows[0];
  return r ? { required: r.required as number, onChip: r.on_chip as number } : null;
}
