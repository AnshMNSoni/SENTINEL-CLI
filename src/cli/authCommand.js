#!/usr/bin/env node

/**
 * Sentinel Auth CLI (deprecated)
 *
 * Auth is now managed through the TUI. Run `sentinel` and use:
 *   /auth   - Configure API keys
 *   /models - List and manage AI providers
 */

import chalk from 'chalk';
import { configManager } from '../config/configManager.js';

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-4o, GPT-3.5-turbo',
    envVar: 'OPENAI_API_KEY',
    placeholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5, Claude 3 Opus/Sonnet',
    envVar: 'ANTHROPIC_API_KEY',
    placeholder: 'sk-ant-...',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini Pro, Gemini 1.5 Flash',
    envVar: 'GEMINI_API_KEY',
    placeholder: 'AI...',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Llama 3, Mixtral (fast inference)',
    envVar: 'GROQ_API_KEY',
    placeholder: 'gsk_...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ models via one API',
    envVar: 'OPENROUTER_API_KEY',
    placeholder: 'sk-or-...',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local LLMs via Ollama',
    envVar: 'OLLAMA_HOST',
    placeholder: 'http://localhost:11434',
  },
];

function redirectToTui() {
  console.log('');
  console.log(chalk.cyan('⚡ Auth is now managed inside the Sentinel TUI.'));
  console.log('');
  console.log(chalk.bold('  Run:') + chalk.green(' sentinel'));
  console.log('');
  console.log(chalk.gray('  Then use TUI commands:'));
  console.log(chalk.gray('    /auth     Configure API keys'));
  console.log(chalk.gray('    /models   List and manage AI providers'));
  console.log(chalk.gray('    /setup    Run setup wizard'));
  console.log('');
}

export async function runAuthCommand(args = []) {
  const subcommand = args[0]?.toLowerCase();

  if (subcommand === 'set' && args[1] && args[2]) {
    await configManager.load();
    await configManager.setApiKey(args[1], args[2]);
    console.log(chalk.green(`✓ ${args[1]} API key saved.`));
    return;
  }

  if (subcommand === 'status') {
    await configManager.load();
    const configured = configManager.getConfiguredProviders();
    if (configured.length > 0) {
      console.log(
        chalk.green(`✓ ${configured.length} provider(s) configured: ${configured.join(', ')}`)
      );
    } else {
      console.log(chalk.yellow('No providers configured. Use the TUI to set up.'));
    }
    return;
  }

  redirectToTui();
}

export default runAuthCommand;
