import { jsx as _jsx } from "@opentui/react/jsx-runtime";
import { useTheme } from "../providers/theme";
export function Header() {
    const { colors } = useTheme();
    return (_jsx("box", { justifyContent: "center", alignItems: "center", paddingY: 1, children: _jsx("box", { flexDirection: "row", justifyContent: "center", gap: 0.5, alignItems: "center", children: _jsx("ascii-font", { font: "tiny", text: "Sentinel", color: colors.primary }) }) }));
}
//# sourceMappingURL=header.js.map