import { useEffect, useState } from "react";
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
  toolName?: string;
  toolCallId?: string;
  input?: unknown;
  state?: "pending" | "output-available" | "output-error";
  output?: unknown;
  errorText?: string;
};

type Props = {
  parts: MessagePart[];
  model?: string;
  duration?: number;
};

const SPINNER_FRAMES = ["\u25D0", "\u25D3", "\u25D1", "\u25D2"];

function PendingSpinner() {
  const [frame, setFrame] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % SPINNER_FRAMES.length), 120);
    return () => clearInterval(id);
  }, []);

  return <text fg={colors.info}>{SPINNER_FRAMES[frame]}</text>;
}

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

function ToolCallBlock({ part }: { part: MessagePart }) {
  const { colors } = useTheme();

  if (part.toolCall) {
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
              {"\u2699"} {part.toolCall.name}
            </text>
            {part.toolCall.args ? (
              <text attributes={TextAttributes.DIM}>
                {JSON.stringify(part.toolCall.args, null, 2)}
              </text>
            ) : null}
            {part.toolCall.result ? (
              <text attributes={TextAttributes.DIM} fg={colors.success}>
                {"\u2713"} Done
              </text>
            ) : null}
          </box>
        </box>
      </box>
    );
  }

  const isPending = part.state === "pending";
  const isDone = part.state === "output-available";
  const isError = part.state === "output-error";

  return (
    <box width="100%" paddingY={1}>
      <box
        border={["left"]}
        borderColor={isError ? colors.error : colors.info}
        width="100%"
        customBorderChars={{ ...EmptyBorder, vertical: "\u2503" }}
      >
        <box paddingX={2} paddingY={1} flexDirection="column" width="100%">
          <box flexDirection="row" gap={1}>
            {isPending ? <PendingSpinner /> : <text fg={colors.info}>{"\u2699"}</text>}
            <text fg={isError ? colors.error : colors.info}>
              {part.toolName}
            </text>
          </box>
          {part.input !== undefined ? (
            <text attributes={TextAttributes.DIM}>
              {JSON.stringify(part.input, null, 2)}
            </text>
          ) : null}
          {isPending ? (
            <text attributes={TextAttributes.DIM}>(running...)</text>
          ) : null}
          {isDone ? (
            <text attributes={TextAttributes.DIM}>
              {part.output !== undefined
                ? JSON.stringify(part.output).slice(0, 500)
                : ""}
            </text>
          ) : null}
          {isDone ? (
            <text attributes={TextAttributes.DIM} fg={colors.success}>
              Done
            </text>
          ) : null}
          {isError && part.errorText ? (
            <text attributes={TextAttributes.DIM} fg={colors.error}>
              Error: {part.errorText}
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
              {group.map((p, pi) => <ToolCallBlock key={pi} part={p} />)}
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
