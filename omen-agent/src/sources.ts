/**
 * Live source adapters. No database is mirrored, curated, or transformed —
 * each function fetches from the authoritative source and parses the dump into
 * rows. Field selection is not curation: nothing is interpreted, ranked by
 * editorial judgement, or dropped for being inconvenient.
 *
 * Everything here is safe to hand to a subagent: none of it touches the user's
 * genome. The personal join happens only in `profile.ts`, in the main agent.
 */

const UA = "omen-genomics (research prototype; contact: dev@heyomen)";

/** Short-lived response cache. Not a mirror — it expires and never diverges. */
const cache = new Map<string, { at: number; body: string }>();
const TTL_MS = 15 * 60 * 1000;

async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.body;

  const res = await fetch(url, {
    ...init,
    headers: { "user-agent": UA, ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    throw new Error(`${url.split("?")[0]} → HTTP ${res.status}`);
  }
  const body = await res.text();
  cache.set(url, { at: Date.now(), body });
  return body;
}

/* ── Ontology search (EMBL-EBI OLS4) ────────────────────────────────────── */

export type OntologyTerm = {
  id: string; // e.g. "MONDO_0005148"
  label: string;
  ontology: string;
  description: string | null;
};

/**
 * Free text → ontology terms.
 *
 * Searches EFO, MONDO and HP together: GWAS Catalog has migrated many traits
 * from EFO to MONDO, so an EFO-only search silently misses them. Type 2
 * diabetes is MONDO_0005148, not EFO_0001360 — querying the wrong ontology
 * returns zero results with a 200, which looks like "no evidence" rather than
 * "wrong question".
 */
export async function searchTraits(query: string, limit = 12): Promise<OntologyTerm[]> {
  const url =
    "https://www.ebi.ac.uk/ols4/api/search" +
    `?q=${encodeURIComponent(query)}&ontology=efo,mondo,hp&rows=${limit}`;
  const raw = JSON.parse(await fetchText(url));
  return (raw.response?.docs ?? []).map((d: any) => ({
    id: d.short_form,
    label: d.label,
    ontology: d.ontology_prefix ?? d.ontology_name ?? "",
    description: Array.isArray(d.description) ? (d.description[0] ?? null) : null,
  }));
}

/* ── GWAS Catalog ───────────────────────────────────────────────────────── */

export type GwasAssociation = {
  rsid: string;
  riskAllele: string | null;
  trait: string;
  pValue: string;
  orOrBeta: string;
  mappedGene: string;
  pubmedId: string;
  study: string;
  sampleSize: string;
};

/**
 * Trait → every published association, as a dump.
 *
 * The REST `/efoTraits/{id}/associations` endpoint ignores `size` and streams
 * ~6 MB that never terminates inside a sane timeout. The website's download
 * endpoint returns the same data as a complete TSV instead, which is what this
 * uses. `limit` is pagination, not selection — `total` always reports the true
 * count so the caller knows what was left on the table.
 */
export async function gwasByTrait(
  ontologyId: string,
  opts: { limit?: number; rsids?: string[] } = {},
): Promise<{ total: number; returned: GwasAssociation[]; truncated: boolean }> {
  const url =
    "https://www.ebi.ac.uk/gwas/api/search/downloads" +
    `?q=${encodeURIComponent(ontologyId)}&efo=true` +
    "&pvalfilter=&orfilter=&betafilter=&datefilter=&genomicfilter=" +
    "&traitfilter[]=&dateaddedfilter=&facet=association";

  const tsv = await fetchText(url);
  const lines = tsv.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { total: 0, returned: [], truncated: false };

  const header = lines[0]!.split("\t").map((h) => h.trim().toUpperCase());
  const col = (name: string) => header.indexOf(name);
  const c = {
    rs: col("STRONGEST SNP-RISK ALLELE"),
    trait: col("DISEASE/TRAIT"),
    p: col("P-VALUE"),
    or: col("OR OR BETA"),
    gene: col("MAPPED_GENE"),
    pmid: col("PUBMEDID"),
    study: col("STUDY"),
    n: col("INITIAL SAMPLE SIZE"),
  };

  const wanted = opts.rsids?.length
    ? new Set(opts.rsids.map((r) => r.toLowerCase()))
    : null;

  const rows: GwasAssociation[] = [];
  for (const line of lines.slice(1)) {
    const f = line.split("\t");
    const raw = f[c.rs] ?? "";
    const m = raw.match(/rs\d+/i);
    if (!m) continue; // haplotypes and unmapped entries carry no rsID
    const rsid = m[0].toLowerCase();
    if (wanted && !wanted.has(rsid)) continue;

    rows.push({
      rsid,
      riskAllele: raw.includes("-") ? (raw.split("-").pop()?.trim() ?? null) : null,
      trait: f[c.trait] ?? "",
      pValue: f[c.p] ?? "",
      orOrBeta: f[c.or] ?? "",
      mappedGene: f[c.gene] ?? "",
      pubmedId: f[c.pmid] ?? "",
      study: (f[c.study] ?? "").slice(0, 120),
      sampleSize: (f[c.n] ?? "").slice(0, 120),
    });
  }

  // Strongest evidence first, so a truncated dump keeps the most informative rows.
  rows.sort((a, b) => (Number(a.pValue) || 1) - (Number(b.pValue) || 1));

  const limit = opts.limit ?? 400;
  return {
    total: rows.length,
    returned: rows.slice(0, limit),
    truncated: rows.length > limit,
  };
}

/** rsID → its published associations across all traits. */
export async function gwasByVariant(rsid: string): Promise<GwasAssociation[]> {
  const url =
    "https://www.ebi.ac.uk/gwas/api/search/downloads" +
    `?q=${encodeURIComponent(rsid)}&efo=false` +
    "&pvalfilter=&orfilter=&betafilter=&datefilter=&genomicfilter=" +
    "&traitfilter[]=&dateaddedfilter=&facet=association";
  try {
    const r = await gwasByTraitFromTsv(await fetchText(url));
    return r.filter((x) => x.rsid === rsid.toLowerCase());
  } catch {
    return [];
  }
}

async function gwasByTraitFromTsv(tsv: string): Promise<GwasAssociation[]> {
  const lines = tsv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = lines[0]!.split("\t").map((h) => h.trim().toUpperCase());
  const c = {
    rs: header.indexOf("STRONGEST SNP-RISK ALLELE"),
    trait: header.indexOf("DISEASE/TRAIT"),
    p: header.indexOf("P-VALUE"),
    or: header.indexOf("OR OR BETA"),
    gene: header.indexOf("MAPPED_GENE"),
    pmid: header.indexOf("PUBMEDID"),
    study: header.indexOf("STUDY"),
    n: header.indexOf("INITIAL SAMPLE SIZE"),
  };
  const out: GwasAssociation[] = [];
  for (const line of lines.slice(1)) {
    const f = line.split("\t");
    const m = (f[c.rs] ?? "").match(/rs\d+/i);
    if (!m) continue;
    out.push({
      rsid: m[0].toLowerCase(),
      riskAllele: null,
      trait: f[c.trait] ?? "",
      pValue: f[c.p] ?? "",
      orOrBeta: f[c.or] ?? "",
      mappedGene: f[c.gene] ?? "",
      pubmedId: f[c.pmid] ?? "",
      study: (f[c.study] ?? "").slice(0, 120),
      sampleSize: (f[c.n] ?? "").slice(0, 120),
    });
  }
  return out;
}

/* ── gnomAD (population allele frequency) ───────────────────────────────── */

export async function gnomadFrequency(rsid: string) {
  const query = `query($rsid: String!) {
    searchVariants(query: $rsid, dataset: gnomad_r4) { variant_id }
    variant_search: searchVariants(query: $rsid, dataset: gnomad_r4) { variant_id }
  }`;
  try {
    const body = await fetchText("https://gnomad.broadinstitute.org/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables: { rsid } }),
    });
    return JSON.parse(body);
  } catch (e: any) {
    return { error: String(e?.message ?? e) };
  }
}

/* ── ClinVar (NCBI E-utilities) ─────────────────────────────────────────── */

/**
 * Search ClinVar by free text — gene symbol, rsID, or condition.
 *
 * Set NCBI_API_KEY to raise the rate limit from 3 to 10 requests/second.
 */
export async function clinvarSearch(term: string, retmax = 40) {
  const key = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : "";
  const base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

  const search = JSON.parse(
    await fetchText(
      `${base}/esearch.fcgi?db=clinvar&retmode=json&retmax=${retmax}` +
        `&term=${encodeURIComponent(term)}${key}`,
    ),
  );
  const ids: string[] = search.esearchresult?.idlist ?? [];
  if (ids.length === 0) return { total: 0, records: [] };

  const summary = JSON.parse(
    await fetchText(
      `${base}/esummary.fcgi?db=clinvar&retmode=json&id=${ids.join(",")}${key}`,
    ),
  );
  const result = summary.result ?? {};
  const records = ids
    .map((id) => result[id])
    .filter(Boolean)
    .map((r: any) => ({
      title: r.title,
      significance: r.germline_classification?.description ?? r.clinical_significance?.description ?? null,
      reviewStatus: r.germline_classification?.review_status ?? null,
      genes: (r.genes ?? []).map((g: any) => g.symbol),
      conditions: (r.trait_set ?? []).map((t: any) => t.trait_name),
      rsid: r.variation_set?.[0]?.variation_xrefs?.find((x: any) => x.db_source === "dbSNP")
        ?.db_id
        ? `rs${r.variation_set[0].variation_xrefs.find((x: any) => x.db_source === "dbSNP").db_id}`
        : null,
      accession: r.accession,
    }));

  return { total: Number(search.esearchresult?.count ?? records.length), records };
}

/* ── Literature (LitVar / PubTator) ─────────────────────────────────────── */

export async function literatureForVariant(rsid: string, limit = 15) {
  try {
    const body = await fetchText(
      "https://www.ncbi.nlm.nih.gov/research/litvar2-api/variant/get/litvar%40" +
        `${encodeURIComponent(rsid)}%23%23/publications?limit=${limit}`,
    );
    const j = JSON.parse(body);
    return { pmids: j.pmids ?? [], total: j.count ?? (j.pmids?.length ?? 0) };
  } catch (e: any) {
    return { pmids: [], total: 0, error: String(e?.message ?? e) };
  }
}
