import { jsx as _jsx } from "@opentui/react/jsx-runtime";
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { RootLayout } from "./layouts/root-layout";
import { Home } from "./screens/home";
import { Session } from "./screens/session";
import { Dashboard } from "./screens/dashboard";
const router = createMemoryRouter([
    {
        path: "/",
        element: _jsx(RootLayout, {}),
        children: [
            { index: true, element: _jsx(Home, {}) },
            { path: "session", element: _jsx(Session, {}) },
            { path: "dashboard", element: _jsx(Dashboard, {}) },
        ],
    },
]);
function App() {
    return _jsx(RouterProvider, { router: router });
}
const renderer = await createCliRenderer({
    targetFps: 60,
    exitOnCtrlC: false,
});
createRoot(renderer).render(_jsx(App, {}));
//# sourceMappingURL=index.js.map