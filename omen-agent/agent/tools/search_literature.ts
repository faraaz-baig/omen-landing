import { defineTool } from "eve/tools";
import { z } from "zod";
import { literatureForVariant } from "../../src/sources";

export default defineTool({
  description:
    "Find PubMed papers indexed against a specific rsID (LitVar/PubTator). Use " +
    "to gauge how much evidence exists for a variant and to cite sources. A high " +
    "paper count is not evidence of a strong effect — check the GWAS p-values " +
    "and effect sizes for that.",
  inputSchema: z.object({
    rsid: z.string().regex(/^rs\d+$/i),
    limit: z.number().int().min(1).max(50).default(15),
  }),
  async execute({ rsid, limit }) {
    return await literatureForVariant(rsid.toLowerCase(), limit);
  },
});
