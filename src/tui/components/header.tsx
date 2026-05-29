import { useTheme } from "../providers/theme";

export function Header() {
  const { colors } = useTheme();
  return (
    <box justifyContent="center" alignItems="center" paddingY={1}>
      <box flexDirection="column" justifyContent="center" alignItems="center">
        <text fg={colors.primary}>
          Sentinel
        </text>
        <text attributes={1} fg={colors.dimSeparator}>
          AI-Powered Code Guardian
        </text>
      </box>
    </box>
  );
}
