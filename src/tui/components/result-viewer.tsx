import { TextAttributes } from '@opentui/core';
import { useTheme } from '../providers/theme';

type Issue = {
  file?: string;
  line?: number | null;
  severity?: string;
  type?: string;
  title?: string;
  message?: string;
  suggestion?: string;
  confidence?: number;
  tags?: string[];
};

type Props = {
  issues: Issue[];
  title?: string;
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#60A5FA',
  info: '#88C0D0',
};

const SEVERITY_ICONS: Record<string, string> = {
  critical: '\u2622',
  high: '\u26A0',
  medium: '\u25CF',
  low: '\u2193',
  info: '\u2139',
};

function IssueCard({ issue, icon, fg }: { issue: Issue; icon: string; fg: string }) {
  const { colors } = useTheme();
  return (
    <box flexDirection="column" paddingY={0.5} width="100%">
      <box flexDirection="row" gap={1}>
        <text fg={fg}>{icon}</text>
        <text attributes={1} fg={fg}>
          {issue.title || 'Issue'}
        </text>
        {issue.line ? (
          <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
            :{issue.line}
          </text>
        ) : null}
        {issue.confidence ? (
          <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
            {Math.round(issue.confidence * 100)}%
          </text>
        ) : null}
      </box>
      <box paddingLeft={2}>
        <text attributes={TextAttributes.DIM}>{issue.message}</text>
      </box>
      {issue.file ? (
        <box paddingLeft={2}>
          <text attributes={TextAttributes.DIM} fg={colors.info}>
            {'\u2192'} {issue.file}
          </text>
        </box>
      ) : null}
      {issue.suggestion ? (
        <box paddingLeft={2}>
          <text attributes={TextAttributes.DIM} fg={colors.success}>
            {'\u2713'} {issue.suggestion}
          </text>
        </box>
      ) : null}
      {issue.tags && issue.tags.length > 0 ? (
        <box paddingLeft={2} flexDirection="row" gap={1}>
          {issue.tags.slice(0, 4).map(t => (
            <text key={t} attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
              #{t}
            </text>
          ))}
        </box>
      ) : null}
    </box>
  );
}

export function ResultViewer({ issues, title }: Props) {
  const { colors } = useTheme();
  if (!issues || issues.length === 0) {
    return (
      <box padding={2}>
        <text fg={colors.success}>{'\u2713'} No issues found.</text>
      </box>
    );
  }

  const grouped: Record<string, Issue[]> = {};
  for (const issue of issues) {
    const sev = issue.severity || 'info';
    if (!grouped[sev]) grouped[sev] = [];
    grouped[sev].push(issue);
  }

  const sevOrder = ['critical', 'high', 'medium', 'low', 'info'];
  const sorted = sevOrder.filter(s => grouped[s]);

  return (
    <box flexDirection="column" width="100%" paddingY={1} gap={1}>
      {title ? (
        <text attributes={1} fg={colors.primary}>
          {title}
        </text>
      ) : null}
      <text attributes={TextAttributes.DIM}>
        {issues.length} issue{issues.length !== 1 ? 's' : ''} found
      </text>
      {sorted.map(sev => {
        const items = grouped[sev];
        const color = SEVERITY_COLORS[sev] || colors.info;
        const icon = SEVERITY_ICONS[sev] || '\u25CF';
        return (
          <box key={sev} flexDirection="column" width="100%">
            <box
              border={['bottom']}
              borderColor={colors.dimSeparator}
              paddingY={0.5}
              flexDirection="row"
              gap={1}
            >
              <text attributes={1} fg={color}>
                {icon} {sev.toUpperCase()}
              </text>
              <text attributes={TextAttributes.DIM}>{items.length}</text>
            </box>
            {items.map((issue, i) => (
              <IssueCard key={i} issue={issue} icon={icon} fg={color} />
            ))}
          </box>
        );
      })}
    </box>
  );
}
