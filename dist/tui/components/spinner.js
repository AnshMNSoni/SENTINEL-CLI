import { jsx as _jsx } from "@opentui/react/jsx-runtime";
import { useTheme } from "../providers/theme";
export function Spinner({ mode = "BUILD" }) {
    const { colors } = useTheme();
    const activeColor = mode === "PLAN" ? colors.planMode : colors.primary;
    return _jsx("spinner", { name: "aesthetic", color: activeColor });
}
//# sourceMappingURL=spinner.js.map