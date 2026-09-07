import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

/**
 * Model calls route through OpenRouter rather than Vercel AI Gateway.
 *
 * Eve resolves bare `provider/model-id` strings via the AI Gateway catalog;
 * passing a provider-authored `LanguageModel` calls the provider directly.
 * The tradeoff is that Eve can no longer look up the model's context window,
 * which it needs to schedule compaction — so `modelContextWindowTokens` has to
 * be supplied explicitly. Without it the agent fails to compile.
 */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default defineAgent({
  model: openrouter("moonshotai/kimi-k3"),
  // Sibling of `model`, not nested inside it. Skips the Gateway lookup.
  modelContextWindowTokens: 1_000_000,
  compaction: {
    // The compaction summary model needs its own window hint for the same reason.
    modelContextWindowTokens: 1_000_000,
  },
  // No authored tool needs bash, a filesystem, or a sandbox. Turning the
  // optional defaults off removes ~20s of microsandbox startup per session,
  // an entire billing line, and a large attack surface for health data.
  defaultTools: false,
  reasoning: "low",

  limits: {
    // A research loop with subagents is exactly the shape that can run away
    // quietly. Cap it per session rather than discovering the cost later.
    maxTokenCostUsdPerSession: 2.0,
    maxOutputTokensPerSession: 60_000,
  },
});
