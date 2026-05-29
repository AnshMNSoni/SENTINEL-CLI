import { type ReactNode } from "react";
type KeyboardResponder = (key: string) => boolean;
type KeyboardLayerContextValue = {
    push: (id: string, responder?: KeyboardResponder) => void;
    pop: (id: string) => void;
    isTopLayer: (id: string) => boolean;
    setResponder: (id: string, responder: KeyboardResponder) => void;
};
export declare function KeyboardLayerProvider({ children }: {
    children: ReactNode;
}): ReactNode;
export declare function useKeyboardLayer(): KeyboardLayerContextValue;
export {};
//# sourceMappingURL=index.d.ts.map