export type OllamaModel = {
    name: string;
    size: number;
    modified: string;
};
export declare function getOllamaModels(): Promise<OllamaModel[]>;
export declare function chat(prompt: string, options?: {
    systemPrompt?: string;
}): Promise<string>;
export declare function getProviderInfo(): Promise<{
    id: string;
    provider: string;
    model: string;
    enabled: boolean;
    hasKey: boolean;
}[]>;
//# sourceMappingURL=chat.d.ts.map