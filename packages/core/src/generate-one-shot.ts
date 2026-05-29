import type { GenerateInput, GenerateOutput } from './index.js';
import type { GenerateViaAgentDeps } from './agent.js';
import { generateViaAgent } from './agent.js';

/**
 * Lightweight, single-response generation mode.
 *
 * This mode:
 *  - Disables all agentic tools
 *  - Disables planning / tool guidance
 *  - Forces a single, final response from the model
 *  - Minimizes prompt bloat and token usage
 *
 * It is provider-agnostic and works with any configured model.
 */
export async function generateOneShot(
  input: GenerateInput,
  deps: GenerateViaAgentDeps = {},
): Promise<GenerateOutput> {
  const oneShotSystemPrompt =
    'You are an expert design assistant. ' +
    'Provide a single, complete, final answer. ' +
    'Do not describe steps. Do not plan. Do not use tools. ' +
    'Do not emit progress messages. ' +
    'Return only the requested result.';

  return generateViaAgent(
    {
      ...input,
      systemPrompt: oneShotSystemPrompt,
      // Keep history minimal for token efficiency
      history: input.history ?? [],
      runPreview: undefined,
      inspectWorkspace: undefined,
      readWorkspaceFiles: undefined,
    },
    {
      ...deps,
      tools: [],
      encourageToolUse: false,
      fs: undefined,
      generateImageAsset: undefined,
      runtimeVerify: undefined,
    },
  );
}
