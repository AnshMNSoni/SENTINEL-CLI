/**
 * System prompt builder for the AI coding agent chat.
 *
 * Mirrors packages/server/src/system-prompt.ts from Nightcode. The PLAN
 * mode prompt restricts tools to read-only operations, while BUILD
 * allows writes, edits, and shell execution.
 */

import { Mode } from "../../../shared/schemas/mode.js";

export function buildSystemPrompt({ mode }) {
  const header =
    "You are an expert software engineer working as a coding assistant inside a terminal application. " +
    "The application has two modes the user can switch between: " +
    "**PLAN** — Read-only analysis and planning. No file modifications. " +
    "**BUILD** — Full implementation with read and write tools.";

  const modeDescription =
    mode === Mode.PLAN
      ? "You are in PLAN mode. Do not modify any files. Analyse the user's request, gather context, and respond with a clear plan."
      : "You are in BUILD mode. You have full read/write access to the user's project directory. Make changes decisively.";

  const toolList =
    mode === Mode.PLAN
      ? "Available tools: readFile, listDirectory, glob, grep, searchWeb."
      : "Available tools: readFile, listDirectory, glob, grep, writeFile, editFile, batchEdit, bash, searchWeb.";

  const rules = [
    "Be decisive — pick a plan and execute it. Don't ask the user to choose between equally-valid options unless absolutely necessary.",
    "Never re-read files you've already read in this conversation.",
    "Batch independent tool calls into a single message.",
    mode === Mode.BUILD
      ? "Use editFile for small changes to existing files. Only use writeFile when creating new files or rewriting most of a file."
      : "If you would need writeFile, editFile, or bash, tell the user to switch to BUILD mode.",
  ].join("\n");

  return [header, modeDescription, toolList, rules].join("\n");
}
