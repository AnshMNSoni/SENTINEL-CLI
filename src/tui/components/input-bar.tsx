import { useCallback, useRef } from "react";
import { useKeyboard } from "@opentui/react";
import type { InputRenderable } from "@opentui/core";
import { useKeyboardLayer } from "../providers/keyboard-layer";
import { useTheme } from "../providers/theme";

type Mode = "BUILD" | "PLAN" | "SCAN" | "FIX";

type Props = {
  onSubmit: (value: string) => void;
  onCommand?: (command: string) => void;
  disabled?: boolean;
  placeholder?: string;
  mode?: Mode;
  onModeToggle?: () => void;
  onCommandPalette?: () => void;
};

export function InputBar({
  onSubmit,
  onCommand,
  disabled = false,
  placeholder = "Ask Sentinel to do anything...",
  mode = "BUILD",
  onModeToggle,
  onCommandPalette,
}: Props) {
  const inputRef = useRef<InputRenderable>(null);
  const { colors } = useTheme();
  const { isTopLayer } = useKeyboardLayer();

  const handleSubmit = useCallback(
    (submittedValue: unknown) => {
      const trimmed = String(submittedValue).trim();
      if (trimmed.length === 0) return;

      if (trimmed.startsWith("/") && onCommand) {
        onCommand(trimmed);
      } else {
        onSubmit(trimmed);
      }
    },
    [onSubmit, onCommand]
  );

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

  return (
    <box flexDirection="row" width="100%" alignItems="center">
      <text fg={activeColor}>{"\u276F"} </text>
      <input
        ref={inputRef}
        placeholder={disabled ? "Processing..." : placeholder}
        focused={!disabled}
        flexGrow={1}
        onSubmit={handleSubmit}
      />
    </box>
  );
}
