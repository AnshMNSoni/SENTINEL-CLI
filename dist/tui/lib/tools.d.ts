export type ToolResult = {
    success: boolean;
    output?: string;
    error?: string;
};
export type ToolDefinition = {
    name: string;
    description: string;
    execute: (args: Record<string, unknown>) => ToolResult | Promise<ToolResult>;
    readOnly: boolean;
};
export declare const TOOLS: Record<string, ToolDefinition>;
export declare function getToolsForMode(mode: 'BUILD' | 'PLAN' | 'SCAN' | 'FIX'): Record<string, ToolDefinition>;
export declare function getModeContext(mode: 'BUILD' | 'PLAN' | 'SCAN' | 'FIX'): string;
export declare function executeTool(name: string, args: Record<string, unknown>, mode: 'BUILD' | 'PLAN' | 'SCAN' | 'FIX'): Promise<ToolResult>;
//# sourceMappingURL=tools.d.ts.map