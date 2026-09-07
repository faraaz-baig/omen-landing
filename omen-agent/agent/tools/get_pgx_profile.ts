import { defineTool } from "eve/tools";
import { z } from "zod";
import { getProfile, provenance } from "../../src/profile";

export default defineTool({
  description:
    "Get the user's pharmacogenomic profile: every gene PharmCAT evaluated, " +
    "its diplotype and metaboliser phenotype, and whether the call is reliable. " +
    "Call this FIRST for any question about the user's own genetics, drug " +
    "response, or metabolism. The `uncallable` list is as important as the " +
    "calls: those genes could not be determined from this file and must never " +
    "be presented as normal or reference.",
  inputSchema: z.object({
    genes: z
      .array(z.string())
      .optional()
      .describe(
        "Optional gene symbols to filter to, e.g. ['CYP2C19','CYP2D6']. " +
          "Omit to get the whole profile.",
      ),
  }),
  async execute({ genes }) {
    const p = await getProfile();
    const wanted = genes?.map((g) => g.toUpperCase());

    const diplotypes = wanted
      ? p.diplotypes.filter((d) => wanted.includes(d.gene.toUpperCase()))
      : p.diplotypes;

    const uncallable = wanted
      ? p.uncallable.filter((u) => wanted.includes(u.gene.toUpperCase()))
      : p.uncallable;

    return {
      diplotypes,
      uncallable,
      summary: {
        genesEvaluated: p.diplotypes.length,
        callable: p.diplotypes.filter((d) => d.callability === "callable").length,
        partial: p.diplotypes.filter((d) => d.callability === "partial").length,
        uncallable: p.diplotypes.filter((d) => d.callability === "uncallable")
          .length,
      },
      dataQuality: {
        variantsGenotyped: p.qc.totalRows,
        noCalls: p.qc.noCallCount,
        noCallRate: p.qc.noCallRate,
        inferredSex: p.qc.inferredSex,
      },
      sources: await provenance(),
    };
  },
});
