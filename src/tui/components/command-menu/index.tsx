import { useCallback, useRef, useState } from "react";
import { TextAttributes } from "@opentui/core";
import type { InputRenderable } from "@opentui/core";
import { useKeyboardLayer } from "../../providers/keyboard-layer";
import { useTheme } from "../../providers/theme";
import { getFilteredCommands } from "./commands";
import type { CommandContext } from "./types";

const MAX_VISIBLE = 8;

type Props = {
  onClose: () => void;
  ctx: CommandContext;
};

export function CommandMenu({ onClose, ctx }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<InputRenderable>(null);
  const { isTopLayer } = useKeyboardLayer();
  const { colors } = useTheme();

  const filtered = getFilteredCommands(query);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  const handleSubmit = useCallback(
    (_value: unknown) => {
      if (filtered[selectedIndex]) {
        const cmd = filtered[selectedIndex];
        if (cmd.action) {
          cmd.action(ctx);
        } else {
          ctx.execute(cmd.value.replace(/^\//, ""));
        }
        onClose();
      }
    },
    [filtered, selectedIndex, ctx, onClose]
  );

  const handleKeyDown = useCallback(
    (key: { name: string }) => {
      if (!isTopLayer("command-menu")) return;
      if (key.name === "up") {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      }
      if (key.name === "down") {
        setSelectedIndex((prev) => Math.min(filtered.length - 1, prev + 1));
      }
      if (key.name === "escape") {
        onClose();
      }
    },
    [filtered.length, selectedIndex, onClose, isTopLayer]
  );

  const visibleHeight = Math.min(filtered.length, MAX_VISIBLE);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "general": return colors.info;
      case "scan": return colors.warning;
      case "git": return colors.primary;
      case "actions": return colors.success;
      case "settings": return colors.planMode;
      case "output": return colors.info;
      case "views": return colors.primary;
      case "ci": return colors.warning;
      case "server": return colors.info;
      default: return colors.dimSeparator;
    }
  };

  return (
    <box position="absolute" top={0} left={0} width="100%" height="100%">
      <box
        backgroundColor="rgba(0,0,0,150)"
        width="100%" height="100%"
        alignItems="center" justifyContent="center"
      >
        <box
          flexDirection="column"
          backgroundColor={colors.dialogSurface}
          width={70}
          padding={1}
          gap={1}
        >
          <input
            ref={inputRef}
            placeholder="Type a command..."
            focused
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
          <scrollbox height={visibleHeight}>
            {filtered.map((cmd, i) => {
              const isSelected = i === selectedIndex;
              return (
                <box
                  key={cmd.value}
                  flexDirection="row"
                  gap={1}
                  backgroundColor={isSelected ? colors.selection + "40" : undefined}
                  paddingX={1}
                  paddingY={0.5}
                >
                  <text fg={getCategoryColor(cmd.category)} width={14}>
                    {cmd.name}
                  </text>
                  <text attributes={TextAttributes.DIM}>{cmd.description}</text>
                </box>
              );
            })}
          </scrollbox>
        </box>
      </box>
    </box>
  );
}
