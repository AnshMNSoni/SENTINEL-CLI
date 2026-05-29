import { useTheme } from "../providers/theme";

export type Mode = "BUILD" | "PLAN" | "SCAN" | "FIX";

type Props = { mode?: Mode };

export function Spinner({ mode = "BUILD" }: Props) {
  const { colors } = useTheme();
  const activeColor = mode === "PLAN" ? colors.planMode : colors.primary;
  return <spinner name="aesthetic" color={activeColor} />;
}
