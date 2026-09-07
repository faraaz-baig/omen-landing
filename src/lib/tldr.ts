/**
 * The TLDR card layer: a small set of well-replicated, plain-language findings
 * across four domains, joined against the user's actual genotypes at render.
 *
 * Editorial rules:
 *  - Only variants whose consumer interpretation is textbook-standard AND whose
 *    plus-strand allele orientation is unambiguous. Variants where the
 *    literature's strand convention is confusable (CLOCK, COL1A1, DRD2) are
 *    deliberately absent — a flipped interpretation is worse than no card.
 *  - Probabilistic language only. Genes influence; they do not determine.
 *  - A missing genotype renders as "not measured", never as a default result.
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export type Domain = "medication" | "diet" | "brain" | "muscle";

type CardDef = {
  domain: Domain;
  rsid: string;
  gene: string;
  title: string;
  /** genotype (sorted alphabetically, e.g. "CT") → plain-language result */
  results: Record<string, { headline: string; detail: string }>;
  caveat?: string;
};

const CARDS: CardDef[] = [
  /* ── diet ── */
  {
    domain: "diet",
    rsid: "rs4988235",
    gene: "LCT",
    title: "Lactose",
    results: {
      GG: {
        headline: "Genetically likely to be lactose intolerant as an adult",
        detail:
          "You carry no copies of the variant that keeps lactase switched on " +
          "after childhood. Many people with this result still handle small " +
          "amounts of dairy, and gut bacteria adapt.",
      },
      AG: {
        headline: "Likely able to digest dairy",
        detail: "One copy of the lactase-persistence variant is usually enough.",
      },
      AA: {
        headline: "Likely able to digest dairy",
        detail: "Two copies of the lactase-persistence variant.",
      },
    },
  },
  {
    domain: "diet",
    rsid: "rs671",
    gene: "ALDH2",
    title: "Alcohol flush",
    results: {
      GG: {
        headline: "No alcohol-flush variant",
        detail:
          "You don't carry the ALDH2 variant behind the facial flush and " +
          "nausea some people get from alcohol. That says nothing about " +
          "whether alcohol is good for you — only that this particular " +
          "reaction isn't in your genetics.",
      },
      AG: {
        headline: "One copy of the alcohol-flush variant",
        detail:
          "Alcohol likely produces flushing and a stronger acetaldehyde " +
          "buildup; drinking with this variant carries extra risk.",
      },
      AA: {
        headline: "Two copies of the alcohol-flush variant",
        detail: "Alcohol is likely strongly unpleasant and higher-risk for you.",
      },
    },
  },
  {
    domain: "diet",
    rsid: "rs762551",
    gene: "CYP1A2",
    title: "Coffee",
    results: {
      CC: {
        headline: "The much-studied caffeine risk genotype isn't yours",
        detail:
          "Studies linking heavy coffee to heart risk concerned people with a " +
          "genotype you don't carry (AA). The genetics of caffeine are " +
          "soft-evidence territory — how coffee makes you feel is better data " +
          "than this card.",
      },
      AC: {
        headline: "One copy of the study-flagged caffeine allele",
        detail:
          "Some studies associate this with slower caffeine handling; the " +
          "evidence is inconsistent. Your own response to an afternoon coffee " +
          "is the better guide.",
      },
      AA: {
        headline: "The genotype the caffeine studies flagged",
        detail:
          "Older studies associated heavy coffee with elevated heart risk in " +
          "this genotype; the literature has replicated inconsistently.",
      },
    },
  },
  {
    domain: "diet",
    rsid: "rs1801133",
    gene: "MTHFR",
    title: "Folate",
    results: {
      GG: {
        headline: "Normal folate metabolism — the MTHFR fuss doesn't apply",
        detail:
          "You carry zero copies of the C677T variant that the supplement " +
          "industry loves to talk about. No genetic case for special " +
          "methylated B vitamins.",
      },
      AG: {
        headline: "One copy of the common MTHFR variant",
        detail:
          "Enzyme activity is modestly reduced — common and rarely meaningful " +
          "with a normal diet. Evidence for special supplementation is weak.",
      },
      AA: {
        headline: "Two copies of the common MTHFR variant",
        detail:
          "Reduced enzyme activity; adequate dietary folate matters a bit " +
          "more for you. Still not the health crisis the internet suggests.",
      },
    },
  },
  /* ── brain ── */
  {
    domain: "brain",
    rsid: "rs4680",
    gene: "COMT",
    title: "Dopamine clearance",
    results: {
      AA: {
        headline: "Met/Met — the slower-clearing, so-called “worrier” profile",
        detail:
          "Prefrontal dopamine lingers longer. Small studies associate this " +
          "with stronger focus and memory under calm conditions, and more " +
          "sensitivity to stress. Effects are subtle; life experience swamps " +
          "this gene.",
      },
      AG: {
        headline: "Val/Met — the intermediate dopamine profile",
        detail: "One fast-clearing and one slow-clearing copy; most people's result.",
      },
      GG: {
        headline: "Val/Val — the faster-clearing, so-called “warrior” profile",
        detail:
          "Dopamine clears quickly; associated in small studies with steadier " +
          "performance under acute stress. Subtle at best.",
      },
    },
  },
  {
    domain: "brain",
    rsid: "rs6265",
    gene: "BDNF",
    title: "Neuroplasticity",
    results: {
      CC: {
        headline: "Val/Val BDNF — typical activity-dependent plasticity",
        detail: "The most common result; no Met copy of the Val66Met variant.",
      },
      CT: {
        headline: "One Met copy of the BDNF Val66Met variant",
        detail:
          "Associated in studies with modestly reduced activity-dependent " +
          "BDNF release — and, interestingly, sometimes with better " +
          "performance on certain tasks. Exercise strongly drives BDNF " +
          "regardless of genotype.",
      },
      TT: {
        headline: "Met/Met BDNF — the least common result",
        detail:
          "Both copies carry Val66Met. The practical lever is unchanged: " +
          "aerobic exercise raises BDNF in every genotype.",
      },
    },
  },
  {
    domain: "brain",
    rsid: "rs5751876",
    gene: "ADORA2A",
    title: "Caffeine sensitivity",
    results: {
      TT: {
        headline: "Likely more sensitive to caffeine's jittery side",
        detail:
          "Small studies link this adenosine-receptor genotype to stronger " +
          "caffeine-induced anxiety and sleep disruption. If afternoon coffee " +
          "wrecks your sleep, your genes agree with you.",
      },
      CT: {
        headline: "Intermediate caffeine sensitivity",
        detail: "One copy of the sensitivity-associated allele.",
      },
      CC: {
        headline: "Typical caffeine sensitivity at this receptor",
        detail: "No copies of the sensitivity-associated allele.",
      },
    },
  },
  /* ── muscle ── */
  {
    domain: "muscle",
    rsid: "rs1815739",
    gene: "ACTN3",
    title: "Fast-twitch muscle",
    results: {
      CC: {
        headline: "Two working copies of the “sprint gene”",
        detail:
          "Alpha-actinin-3 is present in your fast-twitch fibres — the " +
          "genotype overrepresented in elite power athletes. Training still " +
          "beats genetics.",
      },
      CT: {
        headline: "One working copy of the “sprint gene” — the mixed profile",
        detail:
          "One functional ACTN3 copy and one stop-variant copy. Most of the " +
          "world lives here; it's compatible with excelling at power or " +
          "endurance. Training history matters far more.",
      },
      TT: {
        headline: "No alpha-actinin-3 — the profile leaning endurance",
        detail:
          "Both copies carry the stop variant, like ~18% of people. " +
          "Overrepresented in elite endurance athletes; irrelevant to being " +
          "strong at the gym.",
      },
    },
  },
  {
    domain: "muscle",
    rsid: "rs8192678",
    gene: "PPARGC1A",
    title: "Aerobic response",
    results: {
      CC: {
        headline: "Typical PGC-1α — the common aerobic-response profile",
        detail: "No copies of the Gly482Ser variant.",
      },
      CT: {
        headline: "One copy of a variant weakly linked to aerobic trainability",
        detail:
          "Some studies associate Gly482Ser with modestly different " +
          "endurance-training response. Evidence is thin; your training log " +
          "is the real data.",
      },
      TT: {
        headline: "Two copies of the Gly482Ser variant",
        detail:
          "Weakly associated with lower aerobic trainability in some " +
          "studies; findings are inconsistent.",
      },
    },
  },
];

export type TldrCard = {
  domain: Domain;
  gene: string;
  rsid: string;
  title: string;
  genotype: string | null;
  headline: string;
  detail: string;
};

function normalize(genotype: string): string {
  return genotype.split("").sort().join("");
}

export async function getTldrCards(): Promise<TldrCard[]> {
  const ids = CARDS.map((c) => c.rsid);
  const rows = (await sql`
    select rsid, genotype, call_class from user_genotypes where rsid = any(${ids})
  `) as { rsid: string; genotype: string; call_class: string }[];
  const byRsid = new Map(rows.map((r) => [r.rsid, r]));

  return CARDS.map((c) => {
    const row = byRsid.get(c.rsid);
    if (!row || row.call_class !== "called") {
      return {
        domain: c.domain,
        gene: c.gene,
        rsid: c.rsid,
        title: c.title,
        genotype: null,
        headline: "Not measured in your Omen DNA file",
        detail:
          row?.call_class === "no_call"
            ? "Your file carries this position but your sample produced no call."
            : "This position isn't in your Omen DNA file — unknown, not normal.",
      };
    }
    const result = c.results[normalize(row.genotype)];
    if (!result) {
      return {
        domain: c.domain,
        gene: c.gene,
        rsid: c.rsid,
        title: c.title,
        genotype: row.genotype,
        headline: `Genotype ${row.genotype}`,
        detail: "An uncommon genotype at this position — ask below for detail.",
      };
    }
    return {
      domain: c.domain,
      gene: c.gene,
      rsid: c.rsid,
      title: c.title,
      genotype: row.genotype,
      ...result,
    };
  });
}
