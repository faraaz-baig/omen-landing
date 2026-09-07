import { defineTool } from "eve/tools";
import { z } from "zod";
import { getProfile, provenance } from "../../src/profile";

export default defineTool({
  description:
    "Look up pharmacogenomic guideline recommendations for a drug, matched to " +
    "this user's actual diplotypes. Returns CPIC/DPWG/FDA guidance with its " +
    "strength classification, the clinical implication, PubMed citations, and " +
    "any PharmCAT warning that the underlying call rests on incomplete data. " +
    "If the drug is not found, no pharmacogenomic guideline exists for it — say " +
    "that rather than reasoning from general pharmacology.",
  inputSchema: z.object({
    drug: z.string().describe("Drug name, e.g. 'clopidogrel'"),
  }),
  async execute({ drug }) {
    const p = await getProfile();
    const q = drug.toLowerCase().trim();

    const matches = p.recommendations.filter((r) =>
      r.drug.toLowerCase().includes(q),
    );

    if (matches.length === 0) {
      const available = [...new Set(p.recommendations.map((r) => r.drug))].sort();
      return {
        drug: q,
        found: false,
        explanation:
          `No pharmacogenomic guideline covers "${drug}" in CPIC, DPWG or the ` +
          "FDA tables for this user's genes. Absence of a guideline is not " +
          "evidence that genetics do not matter — it means no curated " +
          "gene-drug guidance exists to report.",
        drugsWithGuidance: available,
        sources: await provenance(),
      };
    }

    // Surface the callability of every gene the guidance depends on. A
    // recommendation matched on an uncallable gene is not trustworthy, and the
    // model must be able to see that without a second tool call.
    const genes = [...new Set(matches.flatMap((m) => m.genes))];
    const geneStatus = genes.map((g) => {
      const call = p.diplotypes.find((d) => d.gene === g);
      const unc = p.uncallable.find((u) => u.gene === g);
      return {
        gene: g,
        callability: call?.callability ?? "not_evaluated",
        diplotype: call?.diplotype ?? null,
        phenotype: call?.phenotype ?? null,
        reason: unc?.reason ?? null,
        remedy: unc?.remedy ?? null,
      };
    });

    return {
      drug: matches[0]!.drug,
      found: true,
      recommendations: matches.map((m) => ({
        source: m.source,
        matchedDiplotype: m.matchedDiplotype,
        genes: m.genes,
        population: m.population,
        implication: m.implications[0] ?? null,
        recommendation: m.recommendation,
        strength: m.strength,
        guidelineVersion: m.guidelineVersion,
        url: m.url,
        pmids: m.pmids,
        warnings: m.warnings,
      })),
      geneStatus,
      sources: await provenance(),
    };
  },
});
