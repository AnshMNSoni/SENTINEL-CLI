import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme";

type Mode = "BUILD" | "PLAN" | "SCAN" | "FIX";

type Props = {
  mode?: Mode;
  model?: string;
  statusText?: string;
};

export function StatusBar({ mode = "BUILD", model = "Sentinel AI", statusText }: Props) {
  const { colors } = useTheme();
  return (
    <box flexDirection="row" gap={1} paddingLeft={1}>
      <box flexDirection="row" gap={1}>
        <text fg={mode === "PLAN" ? colors.planMode : colors.primary}>
          {mode}
        </text>
        <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>{"\u203A"}</text>
        <text>{model}</text>
      </box>
      {statusText ? (
        <box flexDirection="row" gap={1}>
          <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>|</text>
          <text attributes={TextAttributes.DIM}>{statusText}</text>
        </box>
      ) : null}
    </box>
  );
}
