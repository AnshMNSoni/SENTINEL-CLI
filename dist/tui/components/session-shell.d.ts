import type { ReactNode } from "react";
type Mode = "BUILD" | "PLAN" | "SCAN" | "FIX";
type Props = {
    children: ReactNode;
    onSubmit: (value: string) => void;
    onCommand?: (command: string) => void;
    inputDisabled?: boolean;
    loading?: boolean;
    mode?: Mode;
    onModeToggle?: () => void;
    onCommandPalette?: () => void;
    model?: string;
    statusText?: string;
};
export declare function SessionShell({ children, onSubmit, onCommand, inputDisabled, loading, mode, onModeToggle, onCommandPalette, model, statusText, }: Props): ReactNode;
export {};
//# sourceMappingURL=session-shell.d.ts.map