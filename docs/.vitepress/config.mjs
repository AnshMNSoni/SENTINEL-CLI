import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Sentinel CLI',
  description: 'AI-Powered Code Guardian - Security scanning, code quality, and automated fixes',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Commands', link: '/commands/analyze' },
      { text: 'Analyzers', link: '/analyzers/overview' },
      { text: 'CI/CD', link: '/ci/github-actions' },
      { text: 'API', link: '/api/overview' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Configuration', link: '/guide/configuration' },
          ]
        },
        {
          text: 'Tutorials',
          items: [
            { text: 'First Scan', link: '/guide/first-scan' },
            { text: 'CI/CD Setup', link: '/guide/cicd-setup' },
            { text: 'Pre-commit Hooks', link: '/guide/pre-commit' },
          ]
        }
      ],
      '/commands/': [
        {
          text: 'Core Commands',
          items: [
            { text: 'analyze', link: '/commands/analyze' },
            { text: 'diff', link: '/commands/diff' },
            { text: 'fix', link: '/commands/fix' },
            { text: 'score', link: '/commands/score' },
          ]
        },
        {
          text: 'Utilities',
          items: [
            { text: 'init', link: '/commands/init' },
            { text: 'watch', link: '/commands/watch' },
            { text: 'doctor', link: '/commands/doctor' },
          ]
        }
      ],
      '/analyzers/': [
        {
          text: 'Analyzers',
          items: [
            { text: 'Overview', link: '/analyzers/overview' },
            { text: 'Security', link: '/analyzers/security' },
            { text: 'Secrets', link: '/analyzers/secrets' },
            { text: 'Quality', link: '/analyzers/quality' },
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/KunjShah95/SENTINEL-CLI' },
      { icon: 'twitter', link: 'https://twitter.com' },
      { icon: 'discord', link: 'https://discord.gg' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Sentinel CLI'
    },
    search: {
      provider: 'local'
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ]
})
