import { Config } from "../../config/config.js";
import { configManager } from "../../config/configManager.js";
import LLMOrchestrator from "../../llm/llmOrchestrator.js";

export type OllamaModel = {
  name: string;
  size: number;
  modified: string;
};

function getOllamaHost(): string {
  return process.env.OLLAMA_HOST || configManager.getApiKey("ollama") || "http://localhost:11434";
}

export async function getOllamaModels(): Promise<OllamaModel[]> {
  try {
    const host = getOllamaHost();
    const res = await fetch(`${host}/api/tags`);
    if (!res.ok) return [];
    const data: any = await res.json();
    if (!data?.models || !Array.isArray(data.models)) return [];
    return data.models.map((m: any) => ({
      name: m.name,
      size: m.size || 0,
      modified: m.modified_at || "",
    }));
  } catch {
    return [];
  }
}

let orchestratorInstance: LLMOrchestrator | null = null;

async function getOrchestrator(): Promise<LLMOrchestrator> {
  if (orchestratorInstance) return orchestratorInstance;

  const config = new Config();
  await config.load();

  await configManager.load();
  configManager.injectEnvVars();

  const defaultProviders: any[] = config.get("ai.providers", []);
  const mergedProviders = defaultProviders
    .map((p: any) => {
      const envKey = p.apiKeyEnv || "";
      const stored = configManager.getApiKey(p.provider);
      return {
        ...p,
        apiKey: stored || process.env[envKey] || "",
      };
    })
    .filter((p: any) => p.enabled && (p.provider === "local" || p.apiKey));

  orchestratorInstance = new LLMOrchestrator({
    providers: mergedProviders,
    temperature: config.get("ai.temperature", 0.3),
    maxTokens: config.get("ai.maxTokens", 2000),
  });

  return orchestratorInstance;
}

export async function chat(
  prompt: string,
  options: { systemPrompt?: string } = {}
): Promise<string> {
  const orchestrator = await getOrchestrator();
  const result = await orchestrator.chat(prompt, options);
  return result.text;
}

export async function getProviderInfo(): Promise<{ id: string; provider: string; model: string; enabled: boolean; hasKey: boolean }[]> {
  const config = new Config();
  await config.load();
  await configManager.load();

  const providers: any[] = config.get("ai.providers", []);

  const ollamaModels = await getOllamaModels();

  return providers.map((p: any) => {
    const storedKey = configManager.getApiKey(p.provider);
    const envKey = p.apiKeyEnv || "";
    const hasKey = !!(storedKey || process.env[envKey]);

    let model = p.model || "unknown";
    if (p.provider === "ollama" && ollamaModels.length > 0) {
      model = ollamaModels.map((m) => m.name).join(", ");
    }

    return {
      id: p.id,
      provider: p.provider,
      model,
      enabled: p.enabled !== false,
      hasKey,
    };
  });
}
