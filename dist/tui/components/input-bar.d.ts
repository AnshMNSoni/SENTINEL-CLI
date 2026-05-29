type Mode = "BUILD" | "PLAN" | "SCAN" | "FIX";
type Props = {
    onSubmit: (value: string) => void;
    onCommand?: (command: string) => void;
    disabled?: boolean;
    placeholder?: string;
    mode?: Mode;
    onModeToggle?: () => void;
    onCommandPalette?: () => void;
};
export declare function InputBar({ onSubmit, onCommand, disabled, placeholder, mode, onModeToggle, onCommandPalette, }: Props): import("react").ReactNode;
export {};
//# sourceMappingURL=input-bar.d.ts.map