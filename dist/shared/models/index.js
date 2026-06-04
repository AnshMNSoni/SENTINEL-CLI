/**
 * Model registry — supported chat models, provider options, pricing, and
 * credit-conversion math. Mirrors packages/shared/src/models.ts from Nightcode.
 *
 * Sentinel already supports more providers (openai, anthropic, gemini, groq,
 * ollama, openrouter) than Nightcode, so this registry is the union with
 * the parity-only set used by the AI coding agent chat.
 */

export const USD_PER_CREDIT = 0.01;

export const SupportedProvider = Object.freeze({
  ANTHROPIC: "anthropic",
  OPENAI: "openai",
  GOOGLE: "google",
  GROQ: "groq",
  OPENROUTER: "openrouter",
  OLLAMA: "ollama",
});

/**
 * @typedef {Object} ChatModelDefinition
 * @property {string} id
 * @property {keyof typeof SupportedProvider} provider
 * @property {number} inputUsdPerMillionTokens
 * @property {number} outputUsdPerMillionTokens
 * @property {boolean} [thinking]
 * @property {string} [label]
 */

/** @type {ReadonlyArray<ChatModelDefinition>} */
export const SUPPORTED_CHAT_MODELS = Object.freeze([
  // Anthropic
  { id: "claude-opus-4-6", provider: SupportedProvider.ANTHROPIC, inputUsdPerMillionTokens: 5, outputUsdPerMillionTokens: 25, thinking: true, label: "Claude Opus 4.6" },
  { id: "claude-sonnet-4-6", provider: SupportedProvider.ANTHROPIC, inputUsdPerMillionTokens: 3, outputUsdPerMillionTokens: 15, thinking: true, label: "Claude Sonnet 4.6" },
  { id: "claude-haiku-4-5", provider: SupportedProvider.ANTHROPIC, inputUsdPerMillionTokens: 1, outputUsdPerMillionTokens: 5, label: "Claude Haiku 4.5" },

  // OpenAI
  { id: "gpt-5.4", provider: SupportedProvider.OPENAI, inputUsdPerMillionTokens: 2.5, outputUsdPerMillionTokens: 15, thinking: true, label: "GPT-5.4" },
  { id: "gpt-5.4-mini", provider: SupportedProvider.OPENAI, inputUsdPerMillionTokens: 0.75, outputUsdPerMillionTokens: 4.5, label: "GPT-5.4 mini" },
  { id: "gpt-5.4-nano", provider: SupportedProvider.OPENAI, inputUsdPerMillionTokens: 0.2, outputUsdPerMillionTokens: 1.25, label: "GPT-5.4 nano" },
  { id: "gpt-4o", provider: SupportedProvider.OPENAI, inputUsdPerMillionTokens: 2.5, outputUsdPerMillionTokens: 10, label: "GPT-4o" },
  { id: "gpt-4o-mini", provider: SupportedProvider.OPENAI, inputUsdPerMillionTokens: 0.15, outputUsdPerMillionTokens: 0.6, label: "GPT-4o mini" },

  // Google
  { id: "gemini-2.5-pro", provider: SupportedProvider.GOOGLE, inputUsdPerMillionTokens: 1.25, outputUsdPerMillionTokens: 10, thinking: true, label: "Gemini 2.5 Pro" },
  { id: "gemini-2.5-flash", provider: SupportedProvider.GOOGLE, inputUsdPerMillionTokens: 0.3, outputUsdPerMillionTokens: 2.5, label: "Gemini 2.5 Flash" },

  // Groq (openai-compatible pricing)
  { id: "llama-3.3-70b-versatile", provider: SupportedProvider.GROQ, inputUsdPerMillionTokens: 0.59, outputUsdPerMillionTokens: 0.79, label: "Llama 3.3 70B (Groq)" },
  { id: "mixtral-8x7b-32768", provider: SupportedProvider.GROQ, inputUsdPerMillionTokens: 0.24, outputUsdPerMillionTokens: 0.24, label: "Mixtral 8x7B (Groq)" },
]);

export const DEFAULT_CHAT_MODEL_ID = "claude-sonnet-4-6";

export function findSupportedChatModel(modelId) {
  return SUPPORTED_CHAT_MODELS.find((m) => m.id === modelId) || null;
}

export function isSupportedChatModel(modelId) {
  return findSupportedChatModel(modelId) !== null;
}

/**
 * Provider options for streaming. Mirrors packages/server/src/lib/models.ts
 * (the thinking config block).
 */
export function getProviderOptions(modelId) {
  const model = findSupportedChatModel(modelId);
  if (!model) return undefined;
  if (model.provider === SupportedProvider.ANTHROPIC && model.thinking) {
    return {
      anthropic: { thinking: { type: "enabled", budgetTokens: 10000 } },
    };
  }
  if (model.provider === SupportedProvider.OPENAI && model.thinking) {
    return {
      openai: { thinking: { reasoningSummary: "detailed" } },
    };
  }
  return undefined;
}

/**
 * Resolve a model ID to provider name + pricing. Used by the credit math.
 */
export function getModelPricing(modelId) {
  const model = findSupportedChatModel(modelId);
  if (!model) {
    throw new Error(`Unsupported billing model: ${modelId}`);
  }
  return {
    provider: model.provider,
    modelId: model.id,
    inputUsdPerMillionTokens: model.inputUsdPerMillionTokens,
    outputUsdPerMillionTokens: model.outputUsdPerMillionTokens,
  };
}

export function estimateCostUsd({ inputTokens, outputTokens }, pricing) {
  if (!pricing) throw new Error("Pricing required");
  const input = (inputTokens / 1_000_000) * pricing.inputUsdPerMillionTokens;
  const output = (outputTokens / 1_000_000) * pricing.outputUsdPerMillionTokens;
  return input + output;
}

export function convertUsdToCredits(estimatedCostUsd) {
  if (estimatedCostUsd <= 0) return 0;
  return Math.max(1, Math.ceil(estimatedCostUsd / USD_PER_CREDIT));
}

/**
 * Calculate credits to bill for a given usage object. Mirrors
 * `calculateCreditsForUsage` in Nightcode's credits.ts.
 * @param {{ provider: string, model: string, usage: { inputTokens: number, outputTokens: number } }} args
 */
export function calculateCreditsForUsage({ provider, model, usage }) {
  if (!usage) throw new Error("usage is required");
  if (!Number.isFinite(usage.inputTokens) || !Number.isFinite(usage.outputTokens)) {
    throw new Error("Credit conversion requires input and output token counts");
  }
  if (usage.inputTokens < 0 || usage.outputTokens < 0) {
    throw new Error("Token counts must be non-negative");
  }
  const pricing = getModelPricing(model);
  if (pricing.provider !== provider) {
    throw new Error(`Unsupported billing provider: ${provider}`);
  }
  const cost = estimateCostUsd(
    { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens },
    pricing
  );
  return { credits: convertUsdToCredits(cost) };
}

/**
 * Pick the underlying SDK function for a model. We don't import the AI SDK
 * provider packages here so this file stays cheap to load — callers wire
 * the actual SDK invocation. This is a soft resolver used by the server.
 */
export function resolveChatModel(modelId) {
  const model = findSupportedChatModel(modelId);
  if (!model) throw new Error(`Unsupported model: ${modelId}`);
  return {
    modelId: model.id,
    provider: model.provider,
    providerOptions: getProviderOptions(modelId),
    label: model.label,
  };
}
