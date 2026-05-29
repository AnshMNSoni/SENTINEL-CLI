import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { SessionShell } from '../components/session-shell';
import { UserMessage, BotMessage, ErrorMessage } from '../components/messages';
import { CommandMenu } from '../components/command-menu';
import { MultiStepAnalyzeDialog } from '../components/dialogs/multi-step-analyze';
import { useTheme } from '../providers/theme';
import { useDialog } from '../providers/dialog';
import { useChat } from '../hooks/use-chat';
import { getDisplayVersion } from '../lib/version';
import { TOOLS } from '../lib/tools';
import type { CommandContext } from '../components/command-menu/types';

export function Session() {
  const location = useLocation();
  const initialState = location.state as {
    message?: string;
    mode?: 'BUILD' | 'PLAN' | 'SCAN' | 'FIX';
  } | null;
  const initialMessage = initialState?.message;
  const initialMode = initialState?.mode;
  const initialSent = useRef(false);

  const { messages, loading, mode, sendInput, sendCommand, toggleMode, setMode, addMessage } =
    useChat({
      persistKey: 'session',
      initialMode,
    });
  const [showCommands, setShowCommands] = useState(false);
  const dialog = useDialog();

  const exitApp = useCallback(() => process.exit(0), []);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const commandCtx: CommandContext = {
    exit: exitApp,
    navigate: (path: string) => navigate(path),
    execute: (action: string) => {
      sendCommand(`/${action}`);
    },
    mode,
    setMode,
  };

  const wrappedSendCommand = useCallback(
    (value: string) => {
      const cmd = value.replace(/^\//, '').split(/\s+/)[0].toLowerCase();
      if (cmd === 'wizard') {
        dialog.open({
          title: 'Multi-Step Analysis Wizard',
          width: 70,
          height: 35,
          children: (
            <MultiStepAnalyzeDialog
              onRun={async (target, analyzers) => {
                addMessage({
                  role: 'user',
                  content: `/analyze ${target} (analyzers: ${analyzers.join(', ')})`,
                  parts: [
                    {
                      type: 'text',
                      text: `/analyze ${target} (analyzers: ${analyzers.join(', ')})`,
                    },
                  ],
                });
                try {
                  const result = await TOOLS.analyze.execute({ files: target });
                  if (result.output) {
                    addMessage({
                      role: 'assistant',
                      content: result.output,
                      parts: [{ type: 'text', text: result.output }],
                    });
                  } else {
                    addMessage({
                      role: 'error',
                      content: result.error || 'Analysis failed',
                      parts: [{ type: 'text', text: result.error || 'Analysis failed' }],
                    });
                  }
                } catch (e) {
                  addMessage({
                    role: 'error',
                    content: String(e),
                    parts: [{ type: 'text', text: String(e) }],
                  });
                }
              }}
            />
          ),
        });
        return;
      }
      sendCommand(value);
    },
    [sendCommand, dialog, addMessage]
  );

  useEffect(() => {
    if (initialMessage && !initialSent.current) {
      initialSent.current = true;
      sendInput(initialMessage);
    }
  }, [initialMessage, sendInput]);

  const handleModeToggle = useCallback(() => toggleMode(), [toggleMode]);
  const handleCommandPalette = useCallback(() => setShowCommands(v => !v), []);

  return (
    <box flexGrow={1} width="100%" height="100%" flexDirection="column">
      <SessionShell
        onSubmit={sendInput}
        onCommand={wrappedSendCommand}
        inputDisabled={loading}
        loading={loading}
        mode={mode}
        onModeToggle={handleModeToggle}
        onCommandPalette={handleCommandPalette}
        model={`Sentinel ${getDisplayVersion()}`}
        statusText={`${messages.length} msgs | ${theme.name}`}
      >
        {messages.length === 0 ? (
          <box padding={2} alignItems="center" justifyContent="center">
            <text attributes={2}>Start a conversation or type /help for commands</text>
          </box>
        ) : null}
        {messages.map(msg => {
          if (msg.role === 'error') {
            return <ErrorMessage key={msg.id} message={msg.content} />;
          }
          if (msg.role === 'user') {
            return <UserMessage key={msg.id} message={msg.content} mode={msg.mode || mode} />;
          }
          if (msg.role === 'assistant' || msg.role === 'system') {
            return <BotMessage key={msg.id} parts={msg.parts} />;
          }
          return null;
        })}
      </SessionShell>

      {showCommands ? (
        <CommandMenu onClose={() => setShowCommands(false)} ctx={commandCtx} />
      ) : null}
    </box>
  );
}
