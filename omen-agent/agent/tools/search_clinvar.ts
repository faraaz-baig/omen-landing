import { defineTool } from "eve/tools";
import { z } from "zod";
import { clinvarSearch } from "../../src/sources";

export default defineTool({
  description:
    "Search ClinVar for clinically interpreted variants by gene symbol, rsID, " +
    "or condition name. Returns clinical significance, review status (how well " +
    "supported the call is), associated conditions and rsIDs. Use gene syntax " +
    "like 'MTHFR[gene]' to scope to a gene. Population data — pair with " +
    "get_my_genotypes before attributing anything to the user.",
  inputSchema: z.object({
    term: z.string().min(2).describe("e.g. 'MTHFR[gene]', 'rs1801133', 'cystic fibrosis'"),
    limit: z.number().int().min(1).max(200).default(40),
  }),
  async execute({ term, limit }) {
    const r = await clinvarSearch(term, limit);
    return {
      term,
      total: r.total,
      returned: r.records.length,
      truncated: r.total > r.records.length,
      records: r.records,
    };
  },
});
