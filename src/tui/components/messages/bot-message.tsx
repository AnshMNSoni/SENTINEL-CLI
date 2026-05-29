import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme";
import { EmptyBorder } from "../border";

type ToolCall = {
  name: string;
  args?: Record<string, unknown>;
  result?: string;
};

type MessagePart = {
  type: "text" | "reasoning" | "tool-call" | "tool-result";
  text?: string;
  toolCall?: ToolCall;
};

type Props = {
  parts: MessagePart[];
  model?: string;
  duration?: number;
};

function ReasoningBlock({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <box width="100%" flexDirection="column" paddingY={1}>
      <box
        border={["left"]}
        borderColor={colors.thinkingBorder}
        width="100%"
        customBorderChars={{ ...EmptyBorder, vertical: "\u2503" }}
      >
        <box paddingX={2} paddingY={1} flexDirection="column" width="100%">
          <text attributes={TextAttributes.DIM} fg={colors.thinking}>
            {text}
          </text>
        </box>
      </box>
    </box>
  );
}

function ToolCallBlock({ toolCall }: { toolCall: ToolCall }) {
  const { colors } = useTheme();
  return (
    <box width="100%" paddingY={1}>
      <box
        border={["left"]}
        borderColor={colors.info}
        width="100%"
        customBorderChars={{ ...EmptyBorder, vertical: "\u2503" }}
      >
        <box paddingX={2} paddingY={1} flexDirection="column" width="100%">
          <text fg={colors.info}>
            {"\u2699"} {toolCall.name}
          </text>
          {toolCall.args ? (
            <text attributes={TextAttributes.DIM}>
              {JSON.stringify(toolCall.args, null, 2)}
            </text>
          ) : null}
          {toolCall.result ? (
            <text attributes={TextAttributes.DIM} fg={colors.success}>
              {"\u2713"} Done
            </text>
          ) : null}
        </box>
      </box>
    </box>
  );
}

export function BotMessage({ parts, model, duration }: Props) {
  const { colors } = useTheme();
  if (parts.length === 0) return null;

  const grouped = parts.reduce<MessagePart[][]>((acc, part) => {
    const last = acc[acc.length - 1];
    if (last && last[0].type === part.type) {
      last.push(part);
    } else {
      acc.push([part]);
    }
    return acc;
  }, []);

  return (
    <box width="100%" flexDirection="column" paddingY={1}>
      {grouped.map((group, gi) => {
        const type = group[0].type;
        if (type === "reasoning") {
          return <ReasoningBlock key={gi} text={group.map((p) => p.text).join("")} />;
        }
        if (type === "tool-call") {
          return (
            <box key={gi} flexDirection="column">
              {group.map((p, pi) =>
                p.toolCall ? <ToolCallBlock key={pi} toolCall={p.toolCall} /> : null
              )}
            </box>
          );
        }
        return (
          <box key={gi} paddingX={1}>
            <text>{group.map((p) => p.text).join("")}</text>
          </box>
        );
      })}
      {model || duration ? (
        <box flexDirection="row" gap={1} paddingX={1} paddingTop={1}>
          {model ? (
            <text attributes={TextAttributes.DIM} fg={colors.info}>
              {model}
            </text>
          ) : null}
          {duration ? (
            <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
              {duration}ms
            </text>
          ) : null}
        </box>
      ) : null}
    </box>
  );
}
