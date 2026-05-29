import type { ReactNode } from "react";

export type DialogConfig = {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  width?: number;
  height?: number;
};
