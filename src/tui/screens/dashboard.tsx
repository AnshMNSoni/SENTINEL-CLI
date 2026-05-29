import { useCallback, useEffect, useState } from 'react';
import { TextAttributes } from '@opentui/core';
import { useTheme } from '../providers/theme';
import { StatusBar } from '../components/status-bar';
import { SentinelBorderChars } from '../components/border';
import { TOOLS } from '../lib/tools';
import { getProviderInfo, getOllamaModels, type OllamaModel } from '../lib/chat';
import { getVersion } from '../lib/version';
import { useNavigate } from 'react-router';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';

type DashboardData = {
  status: string;
  version?: string;
  uptime?: number;
};

type ProviderInfo = {
  id: string;
  provider: string;
  model: string;
  enabled: boolean;
  hasKey: boolean;
};

export function Dashboard() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [cacheStats, setCacheStats] = useState<string>('...');
  const [configStatus, setConfigStatus] = useState<string>('...');
  const [gitInfo, setGitInfo] = useState<string>('...');

  useEffect(() => {
    async function load() {
      try {
        const result = await TOOLS.status.execute({});
        setData({
          status: result.success ? 'healthy' : 'error',
          version: getVersion(),
          uptime: process.uptime(),
        });
      } catch {
        setData({ status: 'error', version: getVersion() });
      }
      try {
        const info = await getProviderInfo();
        setProviders(info);
      } catch {}
      try {
        const models = await getOllamaModels();
        setOllamaModels(models);
      } catch {}
      try {
        const home = process.env.HOME || process.env.USERPROFILE || '~';
        const sessDir = `${home}/.sentinel/sessions`;
        if (existsSync(sessDir)) {
          const files = readdirSync(sessDir).filter(f => f.endsWith('.json'));
          setSessionCount(files.length);
        }
      } catch {}
      try {
        const { cache } = await import('../../utils/cache.js');
        const s = cache.getStats();
        setCacheStats(`${s.memorySize} entries, ${Math.round((s.hitRate || 0) * 100)}% hit rate`);
      } catch {
        setCacheStats('unavailable');
      }
      try {
        if (existsSync('.codereviewrc.json')) {
          const raw = readFileSync('.codereviewrc.json', 'utf-8');
          const cfg = JSON.parse(raw);
          const analyzerCount = cfg.analysis?.enabledAnalyzers?.length || 0;
          const providerCount = cfg.ai?.providers?.length || 0;
          setConfigStatus(`${analyzerCount} analyzers, ${providerCount} providers`);
        } else {
          setConfigStatus('not found');
        }
      } catch {
        setConfigStatus('error reading');
      }
      try {
        const { execSync } = await import('child_process');
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
        setGitInfo(`${branch} @ ${commit}`);
      } catch {
        setGitInfo('not a git repo');
      }
    }
    load();
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <box flexDirection="column" width="100%" height="100%" padding={2}>
      <box flexDirection="row" justifyContent="space-between" alignItems="center" paddingBottom={1}>
        <text attributes={1} fg={colors.primary}>
          {'\u25A0'} Sentinel Dashboard
        </text>
        <box flexDirection="row" gap={1}>
          <box border={SentinelBorderChars as any} borderColor={colors.dimSeparator} paddingX={1}>
            <text selectable fg={colors.info}>
              {'\u2190'} Back
            </text>
          </box>
        </box>
      </box>

      <box flexDirection="row" gap={2} flexGrow={1}>
        <box flexDirection="column" width="50%" gap={1}>
          <box
            border={SentinelBorderChars as any}
            borderColor={colors.dimSeparator}
            padding={1}
            flexDirection="column"
            gap={1}
          >
            <text attributes={1} fg={colors.primary}>
              System Health
            </text>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Status:</text>
              <text fg={data?.status === 'healthy' ? colors.success : colors.error}>
                {data?.status || 'checking...'}
              </text>
            </box>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Version:</text>
              <text>{data?.version || '...'}</text>
            </box>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Uptime:</text>
              <text>{data?.uptime ? `${Math.floor(data.uptime / 60)}m` : '...'}</text>
            </box>
          </box>

          <box
            border={SentinelBorderChars as any}
            borderColor={colors.dimSeparator}
            padding={1}
            flexDirection="column"
            gap={1}
          >
            <text attributes={1} fg={colors.warning}>
              Quick Actions
            </text>
            <box flexDirection="column" gap={0.5}>
              {[
                { label: 'Full Scan', cmd: '/full-scan', color: colors.warning },
                { label: 'Analyze Code', cmd: '/analyze', color: colors.info },
                { label: 'Security Audit', cmd: '/security', color: colors.error },
                { label: 'Scan Secrets', cmd: '/secrets', color: colors.primary },
                { label: 'Review Diff', cmd: '/diff', color: colors.success },
              ].map(action => (
                <box key={action.cmd} flexDirection="row" gap={1}>
                  <text fg={action.color}>
                    {'\u25B6'} {action.label}
                  </text>
                </box>
              ))}
            </box>
          </box>
        </box>

        <box flexDirection="column" width="50%" gap={1}>
          <box
            border={SentinelBorderChars as any}
            borderColor={colors.dimSeparator}
            padding={1}
            flexDirection="column"
            gap={1}
          >
            <text attributes={1} fg={colors.info}>
              Recent Activity
            </text>
            <text attributes={TextAttributes.DIM}>
              {sessionCount > 0 ? `${sessionCount} saved session(s)` : 'No recent activity'}
            </text>
          </box>

          <box
            border={SentinelBorderChars as any}
            borderColor={colors.dimSeparator}
            padding={1}
            flexDirection="column"
            gap={1}
          >
            <text attributes={1} fg={colors.secure}>
              Ollama Models
            </text>
            {ollamaModels.length === 0 ? (
              <text attributes={TextAttributes.DIM}>No models found (is Ollama running?)</text>
            ) : (
              <box flexDirection="column" gap={0.5}>
                {ollamaModels.slice(0, 6).map(m => {
                  const size =
                    m.size > 1e9
                      ? `${(m.size / 1e9).toFixed(1)}GB`
                      : `${(m.size / 1e6).toFixed(0)}MB`;
                  return (
                    <box key={m.name} flexDirection="row" gap={1}>
                      <text fg={colors.primary}>{'\u25C9'}</text>
                      <text>{m.name}</text>
                      <text attributes={TextAttributes.DIM}>{size}</text>
                    </box>
                  );
                })}
                {ollamaModels.length > 6 ? (
                  <text attributes={TextAttributes.DIM}>...and {ollamaModels.length - 6} more</text>
                ) : null}
              </box>
            )}
          </box>

          <box
            border={SentinelBorderChars as any}
            borderColor={colors.dimSeparator}
            padding={1}
            flexDirection="column"
            gap={1}
          >
            <text attributes={1} fg={colors.primary}>
              Configuration
            </text>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>AI Providers:</text>
              <text>
                {providers.filter(p => p.hasKey).length > 0
                  ? providers
                      .filter(p => p.hasKey)
                      .map(p => p.provider)
                      .join(', ')
                  : 'none configured'}
              </text>
            </box>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Analyzers:</text>
              <text>{Object.keys(TOOLS).length - 5}+</text>
            </box>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Sessions:</text>
              <text>{sessionCount}</text>
            </box>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Ollama Models:</text>
              <text>{ollamaModels.length > 0 ? ollamaModels.length : '\u2014'}</text>
            </box>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Cache:</text>
              <text fg={colors.info}>{cacheStats}</text>
            </box>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Config:</text>
              <text fg={colors.info}>{configStatus}</text>
            </box>
            <box flexDirection="row" justifyContent="space-between">
              <text attributes={TextAttributes.DIM}>Git:</text>
              <text attributes={TextAttributes.DIM}>{gitInfo}</text>
            </box>
          </box>
        </box>
      </box>

      <box paddingTop={1}>
        <StatusBar mode="BUILD" statusText="Dashboard" />
      </box>
    </box>
  );
}
