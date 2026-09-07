/**
 * Server-side reads of the pharmacogenomic profile the pipeline produced.
 *
 * The dashboard renders precomputed state — it never derives genotypes and
 * never calls the agent for panel data. Chat is the only agent surface.
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export type Callability = "callable" | "partial" | "uncallable";

export type Diplotype = {
  gene: string;
  diplotype: string | null;
  phenotype: string | null;
  callability: Callability;
  note: string | null;
};

export type Uncallable = {
  gene: string;
  callability: "partial" | "uncallable";
  reason: string;
  remedy: string;
};

export type Recommendation = {
  drug: string;
  genes: string[];
  source: string;
  strength: string | null;
};

export type DashboardData = {
  file: {
    source: string;
    arrayVersion: string;
    assembly: string;
    rowCount: number;
    noCallCount: number;
    noCallRate: string;
    uploadedAt: string;
    inferredSex: string;
  };
  profile: {
    id: string;
    pharmcatVersion: string | null;
    cpicVersion: string | null;
    completedAt: string | null;
  };
  diplotypes: Diplotype[];
  uncallable: Uncallable[];
  drugCounts: { full: number; partial: number };
};

export async function getDashboardData(): Promise<DashboardData | null> {
  const rows = (await sql`
    select p.id, p.pharmcat_version, p.cpic_version, p.completed_at,
           p.diplotypes, p.uncallable, p.recommendations, p.qc,
           g.source, g.array_version, g.assembly, g.row_count,
           g.no_call_count, g.uploaded_at
    from pgx_profile_current c
    join pgx_profiles p on p.id = c.profile_id
    join genome_files g on g.id = p.genome_file_id
    where p.status = 'complete'
    limit 1
  `) as Record<string, unknown>[];

  const r = rows[0];
  if (!r) return null;

  const diplotypes = (r.diplotypes ?? []) as Diplotype[];
  const uncallable = (r.uncallable ?? []) as Uncallable[];
  const recommendations = (r.recommendations ?? []) as Recommendation[];
  const qc = (r.qc ?? {}) as { inferredSex?: string };

  // Per-drug: full when every gene its guidance cites is cleanly callable.
  const byGene = new Map(diplotypes.map((d) => [d.gene, d.callability]));
  const drugs = new Map<string, boolean>();
  for (const rec of recommendations) {
    const full =
      rec.genes.length > 0 &&
      rec.genes.every((g) => byGene.get(g) === "callable");
    // A drug counts as "full" only if every one of its recommendations is.
    drugs.set(rec.drug, (drugs.get(rec.drug) ?? true) && full);
  }

  const order: Record<Callability, number> = {
    callable: 0,
    partial: 1,
    uncallable: 2,
  };

  return {
    file: {
      source: String(r.source),
      arrayVersion: String(r.array_version),
      assembly: String(r.assembly),
      rowCount: Number(r.row_count),
      noCallCount: Number(r.no_call_count),
      noCallRate:
        ((Number(r.no_call_count) / Number(r.row_count)) * 100).toFixed(2) + "%",
      uploadedAt: new Date(String(r.uploaded_at)).toISOString().slice(0, 10),
      inferredSex: qc.inferredSex ?? "unknown",
    },
    profile: {
      id: String(r.id),
      pharmcatVersion: r.pharmcat_version ? String(r.pharmcat_version) : null,
      cpicVersion: r.cpic_version ? String(r.cpic_version) : null,
      completedAt: r.completed_at
        ? new Date(String(r.completed_at)).toISOString().slice(0, 10)
        : null,
    },
    diplotypes: [...diplotypes].sort(
      (a, b) =>
        order[a.callability] - order[b.callability] ||
        a.gene.localeCompare(b.gene),
    ),
    uncallable,
    drugCounts: {
      full: [...drugs.values()].filter(Boolean).length,
      partial: [...drugs.values()].filter((v) => !v).length,
    },
  };
}
