export type ThemeColors = {
    primary: string;
    planMode: string;
    selection: string;
    thinking: string;
    success: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    dialogSurface: string;
    thinkingBorder: string;
    dimSeparator: string;
    warning: string;
    critical: string;
    secure: string;
};
export type Theme = {
    name: string;
    colors: ThemeColors;
};
export declare const THEMES: Theme[];
export declare const DEFAULT_THEME: Theme;
//# sourceMappingURL=theme.d.ts.map