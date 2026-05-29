export type CommandContext = {
    exit: () => void;
    navigate: (path: string) => void;
    execute: (action: string, args?: Record<string, unknown>) => void;
    mode: "BUILD" | "PLAN" | "SCAN" | "FIX";
    setMode: (mode: "BUILD" | "PLAN" | "SCAN" | "FIX") => void;
};
export type Command = {
    name: string;
    description: string;
    value: string;
    category?: string;
    action?: (ctx: CommandContext) => void | Promise<void>;
};
//# sourceMappingURL=types.d.ts.map