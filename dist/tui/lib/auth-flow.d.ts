type AuthProvider = {
    name: string;
    label: string;
};
export declare function isAuthPending(): boolean;
export declare function getCurrentProvider(): AuthProvider | null;
export declare function getProgress(): string;
export declare function getRemainingCount(): number;
export declare function startAuthWizard(): string;
export declare function initializeProviders(): Promise<string>;
export declare function handleAuthInput(key: string): Promise<string>;
export declare function cancelAuth(): void;
export {};
//# sourceMappingURL=auth-flow.d.ts.map