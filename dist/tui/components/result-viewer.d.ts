type Issue = {
    file?: string;
    line?: number | null;
    severity?: string;
    type?: string;
    title?: string;
    message?: string;
    suggestion?: string;
    confidence?: number;
    tags?: string[];
};
type Props = {
    issues: Issue[];
    title?: string;
};
export declare function ResultViewer({ issues, title }: Props): import("react").ReactNode;
export {};
//# sourceMappingURL=result-viewer.d.ts.map