import { type ReactNode } from "react";
import type { ToastOptions } from "./types";
type ToastContextValue = {
    show: (options: ToastOptions) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
};
export declare function ToastProvider({ children }: {
    children: ReactNode;
}): ReactNode;
export declare function useToast(): ToastContextValue;
export {};
//# sourceMappingURL=index.d.ts.map