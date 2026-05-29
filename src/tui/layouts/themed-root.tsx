import type { ReactNode } from "react";
import { useTheme } from "../providers/theme";

type Props = { children: ReactNode };

export function ThemedRoot({ children }: Props) {
  const { colors } = useTheme();
  return (
    <box backgroundColor={colors.background} width="100%" height="100%" flexGrow={1}>
      {(() => {
        const c: any = children;
        if (c == null) return null;
        if (typeof c === "string" || typeof c === "number") return <text>{c}</text>;
        if (Array.isArray(c)) return c.map((item, i) => (typeof item === "string" || typeof item === "number" ? <text key={i}>{item}</text> : item));
        return c;
      })()}
    </box>
  );
}
