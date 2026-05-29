type ToolCall = {
    name: string;
    args?: Record<string, unknown>;
    result?: string;
};
type MessagePart = {
    type: "text" | "reasoning" | "tool-call" | "tool-result";
    text?: string;
    toolCall?: ToolCall;
};
type Props = {
    parts: MessagePart[];
    model?: string;
    duration?: number;
};
export declare function BotMessage({ parts, model, duration }: Props): import("react").ReactNode;
export {};
//# sourceMappingURL=bot-message.d.ts.map