export type Mode = "BUILD" | "PLAN" | "SCAN" | "FIX";
export type MessagePart = {
    type: "text" | "reasoning" | "tool-call" | "tool-result";
    text?: string;
};
export type Message = {
    id: string;
    role: "user" | "assistant" | "system" | "error";
    content: string;
    mode?: Mode;
    parts: MessagePart[];
    timestamp: number;
};
type UseChatOptions = {
    persistKey?: string;
    initialMessage?: string;
    initialMode?: Mode;
};
export declare function useChat(options?: UseChatOptions): {
    messages: Message[];
    loading: boolean;
    mode: Mode;
    setMode: import("react").Dispatch<import("react").SetStateAction<Mode>>;
    send: (content: string) => Promise<void>;
    sendCommand: (command: string) => Promise<void>;
    sendInput: (value: string) => void;
    clear: () => void;
    toggleMode: () => void;
    addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
};
export {};
//# sourceMappingURL=use-chat.d.ts.map