export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastOptions = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

export const DEFAULT_DURATION = 3000;
