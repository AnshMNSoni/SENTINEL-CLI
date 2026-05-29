import { useTheme } from "../providers/theme";

export function Header() {
  const { colors } = useTheme();
  return (
    <box justifyContent="center" alignItems="center" paddingY={1}>
      <box flexDirection="row" justifyContent="center" gap={0.5} alignItems="center">
        <ascii-font font="tiny" text="Sentinel" color={colors.primary} />
      </box>
    </box>
  );
}
