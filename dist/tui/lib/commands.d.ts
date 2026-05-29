export type CommandHandler = {
    handler: (args: string) => Promise<string>;
    description: string;
};
export declare const COMMAND_HANDLERS: Record<string, CommandHandler>;
//# sourceMappingURL=commands.d.ts.map