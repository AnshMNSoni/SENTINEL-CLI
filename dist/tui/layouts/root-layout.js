import { jsx as _jsx } from "@opentui/react/jsx-runtime";
import { ThemeProvider } from "../providers/theme";
import { ToastProvider } from "../providers/toast";
import { KeyboardLayerProvider } from "../providers/keyboard-layer";
import { DialogProvider } from "../providers/dialog";
import { ThemedRoot } from "./themed-root";
import { Outlet } from "react-router";
export function RootLayout() {
    return (_jsx(ThemeProvider, { children: _jsx(ToastProvider, { children: _jsx(KeyboardLayerProvider, { children: _jsx(DialogProvider, { children: _jsx(ThemedRoot, { children: _jsx(Outlet, {}) }) }) }) }) }));
}
//# sourceMappingURL=root-layout.js.map