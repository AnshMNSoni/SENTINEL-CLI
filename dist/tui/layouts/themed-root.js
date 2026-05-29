import { jsx as _jsx } from "@opentui/react/jsx-runtime";
import { useTheme } from "../providers/theme";
export function ThemedRoot({ children }) {
    const { colors } = useTheme();
    return (_jsx("box", { backgroundColor: colors.background, width: "100%", height: "100%", flexGrow: 1, children: (() => {
            const c = children;
            if (c == null)
                return null;
            if (typeof c === "string" || typeof c === "number")
                return _jsx("text", { children: c });
            if (Array.isArray(c))
                return c.map((item, i) => (typeof item === "string" || typeof item === "number" ? _jsx("text", { children: item }, i) : item));
            return c;
        })() }));
}
//# sourceMappingURL=themed-root.js.map