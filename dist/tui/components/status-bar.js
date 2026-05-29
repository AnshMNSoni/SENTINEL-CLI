import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme";
export function StatusBar({ mode = "BUILD", model = "Sentinel AI", statusText }) {
    const { colors } = useTheme();
    return (_jsxs("box", { flexDirection: "row", gap: 1, paddingLeft: 1, children: [_jsxs("box", { flexDirection: "row", gap: 1, children: [_jsx("text", { fg: mode === "PLAN" ? colors.planMode : colors.primary, children: mode }), _jsx("text", { attributes: TextAttributes.DIM, fg: colors.dimSeparator, children: "\u203A" }), _jsx("text", { children: model })] }), statusText && (_jsxs("box", { flexDirection: "row", gap: 1, children: [_jsx("text", { attributes: TextAttributes.DIM, fg: colors.dimSeparator, children: "|" }), _jsx("text", { attributes: TextAttributes.DIM, children: statusText })] }))] }));
}
//# sourceMappingURL=status-bar.js.map