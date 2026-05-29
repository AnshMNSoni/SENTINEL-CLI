import { jsxs as _jsxs, jsx as _jsx } from "@opentui/react/jsx-runtime";
import { useCallback, useRef } from "react";
import { useKeyboard } from "@opentui/react";
import { useKeyboardLayer } from "../providers/keyboard-layer";
import { useTheme } from "../providers/theme";
export function InputBar({ onSubmit, onCommand, disabled = false, placeholder = "Ask Sentinel to do anything...", mode = "BUILD", onModeToggle, onCommandPalette, }) {
    const inputRef = useRef(null);
    const { colors } = useTheme();
    const { isTopLayer } = useKeyboardLayer();
    const handleSubmit = useCallback((submittedValue) => {
        const trimmed = String(submittedValue).trim();
        if (trimmed.length === 0)
            return;
        if (trimmed.startsWith("/") && onCommand) {
            onCommand(trimmed);
        }
        else {
            onSubmit(trimmed);
        }
    }, [onSubmit, onCommand]);
    const activeColor = mode === "PLAN" ? colors.planMode : colors.primary;
    useKeyboard((key) => {
        if (!isTopLayer("dialog") || !isTopLayer("command-menu")) {
            return;
        }
        if (key.name === "tab") {
            onModeToggle?.();
            return;
        }
        if (key.name === "p" && key.ctrl) {
            onCommandPalette?.();
        }
    });
    return (_jsxs("box", { flexDirection: "row", width: "100%", alignItems: "center", children: [_jsxs("text", { fg: activeColor, children: ["\u276F", " "] }), _jsx("input", { ref: inputRef, placeholder: disabled ? "Processing..." : placeholder, focused: !disabled, flexGrow: 1, onSubmit: handleSubmit })] }));
}
//# sourceMappingURL=input-bar.js.map