import { type ReactNode } from "react";
import type { DialogConfig } from "./types";
type DialogContextValue = {
    open: (config: DialogConfig) => void;
    close: () => void;
    isOpen: boolean;
};
export declare function DialogProvider({ children }: {
    children: ReactNode;
}): ReactNode;
export declare function useDialog(): DialogContextValue;
export {};
//# sourceMappingURL=index.d.ts.map