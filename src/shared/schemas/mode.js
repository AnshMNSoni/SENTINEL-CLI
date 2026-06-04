/**
 * PLAN / BUILD mode — read-only vs full tool access.
 *
 * PLAN locks the agent to read-only operations (read, list, glob, grep).
 * BUILD enables write, edit, and shell execution.
 */

export const Mode = Object.freeze({
  BUILD: "BUILD",
  PLAN: "PLAN",
});

export const modeSchema = {
  BUILD: "BUILD",
  PLAN: "PLAN",
};

export function isMode(value) {
  return value === Mode.BUILD || value === Mode.PLAN;
}

export function isReadOnlyTool(toolName) {
  return ["readFile", "listDirectory", "glob", "grep", "searchWeb"].includes(toolName);
}

export function getModeLabel(mode) {
  return mode === Mode.PLAN ? "Plan" : "Build";
}
