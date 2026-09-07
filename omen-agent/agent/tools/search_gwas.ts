import { defineTool } from "eve/tools";
import { z } from "zod";
import { gwasByTrait, gwasByVariant } from "../../src/sources";

export default defineTool({
  description:
    "Fetch published GWAS associations as a dump, either for an ontology term " +
    "(every variant associated with a trait) or for a single rsID (every trait " +
    "associated with a variant). Rows are sorted strongest-p-value first and " +
    "include effect size, mapped gene, study and PubMed id. These are " +
    "POPULATION findings — they say nothing about this user until passed " +
    "through get_my_genotypes.",
  inputSchema: z.object({
    ontologyId: z.string().optional().describe("e.g. 'MONDO_0005148' (from search_traits)"),
    rsid: z.string().optional().describe("e.g. 'rs7903146'"),
    limit: z.number().int().min(1).max(1000).default(300),
  }),
  async execute({ ontologyId, rsid, limit }) {
    if (rsid) {
      const rows = await gwasByVariant(rsid);
      return { mode: "by_variant", rsid, total: rows.length, associations: rows };
    }
    if (!ontologyId) {
      return { error: "Provide either ontologyId or rsid." };
    }
    const r = await gwasByTrait(ontologyId, { limit });
    return {
      mode: "by_trait",
      ontologyId,
      total: r.total,
      returned: r.returned.length,
      truncated: r.truncated,
      truncationNote: r.truncated
        ? `Showing the ${r.returned.length} most significant of ${r.total}. ` +
          "Raise limit if you need more."
        : null,
      associations: r.returned,
    };
  },
});
