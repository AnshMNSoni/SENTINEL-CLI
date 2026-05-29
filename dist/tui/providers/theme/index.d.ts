import { type ReactNode } from "react";
import { type Theme } from "../../theme";
export declare function applyTheme(name: string): void;
type ThemeContextValue = {
    theme: Theme;
    setTheme: (name: string) => void;
    themes: Theme[];
    colors: Theme["colors"];
};
export declare function ThemeProvider({ children }: {
    children: ReactNode;
}): ReactNode;
export declare function useTheme(): ThemeContextValue;
export {};
//# sourceMappingURL=index.d.ts.map