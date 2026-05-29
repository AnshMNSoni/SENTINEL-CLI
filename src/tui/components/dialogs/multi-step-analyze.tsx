import { useCallback, useState } from 'react';
import { TextAttributes } from '@opentui/core';
import { useTheme } from '../../providers/theme';
import { DialogSearchList } from '../dialog-search-list';
import { useDialog } from '../../providers/dialog';

const TARGETS = [
  { id: '.', label: 'Current directory', description: 'Scan entire project' },
  { id: 'src', label: 'Source code', description: 'Scan src/ directory' },
  { id: 'diff', label: 'Staged changes', description: 'Scan git diff only' },
];

const ANALYZERS = [
  { id: 'security', label: 'Security Audit', description: 'Vulnerabilities, injections, crypto' },
  { id: 'secrets', label: 'Secret Scanning', description: 'API keys, tokens, credentials' },
  { id: 'quality', label: 'Code Quality', description: 'Complexity, maintainability, style' },
  { id: 'bugs', label: 'Bug Detection', description: 'Null pointers, race conditions, errors' },
  { id: 'performance', label: 'Performance', description: 'Memory, N+1 queries, perf issues' },
  { id: 'dependency', label: 'Dependencies', description: 'Outdated/vulnerable packages' },
];

type Props = {
  onRun: (target: string, analyzers: string[]) => void;
};

export function MultiStepAnalyzeDialog({ onRun }: Props) {
  const { colors } = useTheme();
  const { close } = useDialog();
  const [step, setStep] = useState<'target' | 'input' | 'confirm'>('target');
  const [target, setTarget] = useState('.');
  const [analyzersInput, setAnalyzersInput] = useState('security, quality, bugs');
  const [customPath, setCustomPath] = useState('');

  const handleTargetSelect = useCallback((item: (typeof TARGETS)[0]) => {
    setTarget(item.id);
    setStep('input');
  }, []);

  const handleAnalyzersSubmit = useCallback(
    (value: unknown) => {
      const raw = String(value || analyzersInput);
      const selected = raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (selected.length > 0) {
        setAnalyzersInput(raw);
        setStep('confirm');
      }
    },
    [analyzersInput]
  );

  const handleConfirm = useCallback(() => {
    const selected = analyzersInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    onRun(customPath || target, selected.length > 0 ? selected : ['security', 'quality', 'bugs']);
    close();
  }, [target, analyzersInput, customPath, onRun, close]);

  if (step === 'target') {
    return (
      <box flexDirection="column" gap={1}>
        <text attributes={1}>Step 1: Select Target</text>
        <text attributes={TextAttributes.DIM}>What files do you want to analyze?</text>
        <DialogSearchList
          items={TARGETS}
          onSelect={handleTargetSelect}
          filterFn={(item, q) => item.label.toLowerCase().includes(q.toLowerCase())}
          renderItem={(item, isSelected) => (
            <box flexDirection="row" gap={1}>
              <text fg={isSelected ? colors.selection : undefined} attributes={isSelected ? 1 : 0}>
                {item.label}
              </text>
              <text attributes={2}>{item.description}</text>
            </box>
          )}
          getKey={item => item.id}
          placeholder="Search targets..."
          emptyText="No matching targets"
        />
        <box flexDirection="row" gap={1} paddingTop={1}>
          <text attributes={TextAttributes.DIM}>Press Enter to select, Esc to cancel</text>
        </box>
      </box>
    );
  }

  if (step === 'input') {
    return (
      <box flexDirection="column" gap={1}>
        <text attributes={1}>Step 2: Select Analyzers</text>
        <text attributes={TextAttributes.DIM}>
          Enter comma-separated analyzer names (or press Enter for defaults):
        </text>
        <box flexDirection="column" gap={0.5} paddingY={1}>
          {ANALYZERS.map(a => (
            <box key={a.id} flexDirection="row" gap={1}>
              <text fg={colors.primary}>{'\u25CF'}</text>
              <text attributes={1}>{a.label}</text>
              <text attributes={TextAttributes.DIM}>{a.description}</text>
            </box>
          ))}
        </box>
        <input
          placeholder="security, quality, bugs"
          focused
          onInput={v => setAnalyzersInput(String(v))}
          onSubmit={handleAnalyzersSubmit}
        />
        <text attributes={TextAttributes.DIM}>Default: security, quality, bugs</text>
      </box>
    );
  }

  return (
    <box flexDirection="column" gap={1}>
      <text attributes={1}>Step 3: Confirm & Run</text>
      <box flexDirection="column" gap={0.5} paddingY={1}>
        <box flexDirection="row" gap={1}>
          <text attributes={1}>Target:</text>
          <text>{customPath || target}</text>
        </box>
        <box flexDirection="row" gap={1}>
          <text attributes={1}>Analyzers:</text>
          <text>{analyzersInput}</text>
        </box>
      </box>
      <input placeholder="Press Enter to run, Esc to cancel" focused onSubmit={handleConfirm} />
    </box>
  );
}
