type Mode = "BUILD" | "PLAN" | "SCAN" | "FIX";
type Props = {
    mode?: Mode;
    model?: string;
    statusText?: string;
};
export declare function StatusBar({ mode, model, statusText }: Props): import("react").ReactNode;
export {};
//# sourceMappingURL=status-bar.d.ts.map