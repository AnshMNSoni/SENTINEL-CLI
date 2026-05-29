import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme";
import { EmptyBorder } from "../border";
function ReasoningBlock({ text }) {
    const { colors } = useTheme();
    return (_jsx("box", { width: "100%", flexDirection: "column", paddingY: 1, children: _jsx("box", { border: ["left"], borderColor: colors.thinkingBorder, width: "100%", customBorderChars: { ...EmptyBorder, vertical: "\u2503" }, children: _jsx("box", { paddingX: 2, paddingY: 1, flexDirection: "column", width: "100%", children: _jsx("text", { attributes: TextAttributes.DIM, fg: colors.thinking, children: text }) }) }) }));
}
function ToolCallBlock({ toolCall }) {
    const { colors } = useTheme();
    return (_jsx("box", { width: "100%", paddingY: 1, children: _jsx("box", { border: ["left"], borderColor: colors.info, width: "100%", customBorderChars: { ...EmptyBorder, vertical: "\u2503" }, children: _jsxs("box", { paddingX: 2, paddingY: 1, flexDirection: "column", width: "100%", children: [_jsxs("text", { fg: colors.info, children: ["\u2699", " ", toolCall.name] }), toolCall.args ? (_jsx("text", { attributes: TextAttributes.DIM, children: JSON.stringify(toolCall.args, null, 2) })) : null, toolCall.result ? (_jsxs("text", { attributes: TextAttributes.DIM, fg: colors.success, children: ["\u2713", " Done"] })) : null] }) }) }));
}
export function BotMessage({ parts, model, duration }) {
    const { colors } = useTheme();
    if (parts.length === 0)
        return null;
    const grouped = parts.reduce((acc, part) => {
        const last = acc[acc.length - 1];
        if (last && last[0].type === part.type) {
            last.push(part);
        }
        else {
            acc.push([part]);
        }
        return acc;
    }, []);
    return (_jsxs("box", { width: "100%", flexDirection: "column", paddingY: 1, children: [grouped.map((group, gi) => {
                const type = group[0].type;
                if (type === "reasoning") {
                    return _jsx(ReasoningBlock, { text: group.map((p) => p.text).join("") }, gi);
                }
                if (type === "tool-call") {
                    return (_jsx("box", { flexDirection: "column", children: group.map((p, pi) => p.toolCall ? _jsx(ToolCallBlock, { toolCall: p.toolCall }, pi) : null) }, gi));
                }
                return (_jsx("box", { paddingX: 1, children: _jsx("text", { children: group.map((p) => p.text).join("") }) }, gi));
            }), model || duration ? (_jsxs("box", { flexDirection: "row", gap: 1, paddingX: 1, paddingTop: 1, children: [model ? (_jsx("text", { attributes: TextAttributes.DIM, fg: colors.info, children: model })) : null, duration ? (_jsxs("text", { attributes: TextAttributes.DIM, fg: colors.dimSeparator, children: [duration, "ms"] })) : null] })) : null] }));
}
//# sourceMappingURL=bot-message.js.map