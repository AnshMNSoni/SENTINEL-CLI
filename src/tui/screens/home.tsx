import { useCallback, useState } from 'react';
import { TextAttributes } from '@opentui/core';
import { Header } from '../components/header';
import { InputBar } from '../components/input-bar';
import { StatusBar } from '../components/status-bar';
import { useTheme } from '../providers/theme';
import { useNavigate } from 'react-router';

type Mode = 'BUILD' | 'PLAN' | 'SCAN' | 'FIX';

function QuickAction({
  cmdKey,
  label,
  description,
  color,
}: {
  cmdKey: string;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <box flexDirection="row" gap={1} paddingY={0.5}>
      <text fg={color} width={20}>
        / {cmdKey}
      </text>
      <text attributes={TextAttributes.DIM}>{description}</text>
    </box>
  );
}

const QUICK_ACTIONS = [
  { cmdKey: 'analyze', label: 'analyze', description: 'Analyze code for issues', color: '#60A5FA' },
  {
    cmdKey: 'full-scan',
    label: 'full-scan',
    description: 'Run all available analyzers',
    color: '#F59E0B',
  },
  {
    cmdKey: 'security',
    label: 'security',
    description: 'Comprehensive security audit',
    color: '#EF4444',
  },
  { cmdKey: 'diff', label: 'diff', description: 'Review staged changes', color: '#34D399' },
  { cmdKey: 'agents', label: 'agents', description: 'Run multi-agent pipeline', color: '#7C3AED' },
  { cmdKey: 'fix', label: 'fix', description: 'Auto-fix detected issues', color: '#10B981' },
  { cmdKey: 'status', label: 'status', description: 'Show system status', color: '#88C0D0' },
  { cmdKey: 'help', label: 'help', description: 'Show available commands', color: '#81A1C1' },
];

export function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('BUILD');
  const { colors } = useTheme();

  const handleSubmit = useCallback(
    (value: string) => {
      navigate('/session', { state: { message: value, mode } });
    },
    [navigate, mode]
  );

  const handleCommand = useCallback(
    (command: string) => {
      navigate('/session', { state: { message: command, mode } });
    },
    [navigate, mode]
  );

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const modes: Mode[] = ['BUILD', 'PLAN', 'SCAN', 'FIX'];
      const idx = modes.indexOf(prev);
      return modes[(idx + 1) % modes.length];
    });
  }, []);

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      paddingX={4}
    >
      <Header />

      <box paddingY={2} paddingX={4} width="100%" maxWidth={80}>
        <box flexDirection="column" gap={0}>
          {QUICK_ACTIONS.map(action => (
            <QuickAction key={action.cmdKey} {...action} />
          ))}
        </box>
      </box>

      <box flexDirection="column" width="100%" maxWidth={80} paddingX={4}>
        <box border={['top']} borderColor={colors.dimSeparator} paddingTop={1} width="100%">
          <text attributes={TextAttributes.DIM}>
            Type a message or /command to start. Tab to toggle modes. Ctrl+P for command palette.
          </text>
        </box>
      </box>

      <box width="100%" maxWidth={80} paddingX={4} paddingTop={1}>
        <InputBar
          onSubmit={handleSubmit}
          onCommand={handleCommand}
          mode={mode}
          onModeToggle={toggleMode}
        />
      </box>

      <box width="100%" maxWidth={80} paddingX={4} paddingTop={1}>
        <StatusBar mode={mode} />
      </box>
    </box>
  );
}
