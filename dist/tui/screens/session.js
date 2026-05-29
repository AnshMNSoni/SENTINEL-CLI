import { jsx as _jsx, jsxs as _jsxs } from "@opentui/react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SessionShell } from "../components/session-shell";
import { UserMessage, BotMessage, ErrorMessage } from "../components/messages";
import { CommandMenu } from "../components/command-menu";
import { useTheme } from "../providers/theme";
import { useChat } from "../hooks/use-chat";
export function Session() {
    const location = useLocation();
    const initialState = location.state;
    const initialMessage = initialState?.message;
    const initialMode = initialState?.mode;
    const initialSent = useRef(false);
    const { messages, loading, mode, sendInput, sendCommand, toggleMode, setMode } = useChat({
        persistKey: "session",
        initialMode,
    });
    const [showCommands, setShowCommands] = useState(false);
    const exitApp = useCallback(() => process.exit(0), []);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const commandCtx = {
        exit: exitApp,
        navigate: (path) => navigate(path),
        execute: (action) => { sendCommand(`/${action}`); },
        mode,
        setMode,
    };
    useEffect(() => {
        if (initialMessage && !initialSent.current) {
            initialSent.current = true;
            sendInput(initialMessage);
        }
    }, [initialMessage, sendInput]);
    const handleModeToggle = useCallback(() => toggleMode(), [toggleMode]);
    const handleCommandPalette = useCallback(() => setShowCommands((v) => !v), []);
    return (_jsxs("box", { flexGrow: 1, width: "100%", height: "100%", flexDirection: "column", children: [_jsxs(SessionShell, { onSubmit: sendInput, onCommand: sendCommand, inputDisabled: loading, loading: loading, mode: mode, onModeToggle: handleModeToggle, onCommandPalette: handleCommandPalette, model: "Sentinel v1.9.0", statusText: `${messages.length} msgs | ${theme.name}`, children: [messages.length === 0 && (_jsx("box", { padding: 2, alignItems: "center", justifyContent: "center", children: _jsx("text", { attributes: 2, children: "Start a conversation or type /help for commands" }) })), messages.map((msg) => {
                        if (msg.role === "error") {
                            return _jsx(ErrorMessage, { message: msg.content }, msg.id);
                        }
                        if (msg.role === "user") {
                            return _jsx(UserMessage, { message: msg.content, mode: msg.mode || mode }, msg.id);
                        }
                        if (msg.role === "assistant" || msg.role === "system") {
                            return (_jsx(BotMessage, { parts: msg.parts }, msg.id));
                        }
                        return null;
                    })] }), showCommands && (_jsx(CommandMenu, { onClose: () => setShowCommands(false), ctx: commandCtx }))] }));
}
//# sourceMappingURL=session.js.map