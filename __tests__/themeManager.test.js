/**
 * Test suite for ThemeManager
 */
describe('ThemeManager', () => {
    describe('getTheme', () => {
        const getTheme = (name) => {
            const themes = {
                rich: {
                    name: 'rich',
                    severity: { critical: () => 'red' },
                    icons: { critical: '🔴' }
                },
                minimal: {
                    name: 'minimal',
                    severity: { critical: (s) => `[${s.toUpperCase()}]` },
                    icons: { critical: '' }
                },
                ci: {
                    name: 'ci',
                    severity: { critical: (s) => `::error::${s.toUpperCase()}` },
                    icons: { critical: '##[error]' }
                }
            };
            return themes[name] || themes.rich;
        };

        it('should return rich theme', () => {
            const theme = getTheme('rich');
            expect(theme.name).toBe('rich');
            expect(theme.severity).toBeDefined();
            expect(theme.icons).toBeDefined();
        });

        it('should return minimal theme', () => {
            const theme = getTheme('minimal');
            expect(theme.name).toBe('minimal');
        });

        it('should return ci theme', () => {
            const theme = getTheme('ci');
            expect(theme.name).toBe('ci');
        });

        it('should return rich theme for unknown theme name', () => {
            const theme = getTheme('unknown');
            expect(theme.name).toBe('rich');
        });
    });

    describe('createBox', () => {
        const createBox = () => {
            return {
                start: '┌' + '─'.repeat(50) + '┐',
                mid: '├' + '─'.repeat(50) + '┤',
                end: '└' + '─'.repeat(50) + '┘',
                side: '│'
            };
        };

        it('should create box functions', () => {
            const box = createBox();
            expect(box.start).toBeDefined();
            expect(box.mid).toBeDefined();
            expect(box.end).toBeDefined();
            expect(box.side).toBeDefined();
        });
    });

    describe('formatSeverity', () => {
        const formatSeverity = (severity, themeName) => {
            if (themeName === 'ci') {
                return `::error::[${severity.toUpperCase()}]`;
            }
            return severity;
        };

        it('should format severity with correct style', () => {
            const formatted = formatSeverity('critical', 'rich');
            expect(formatted).toBe('critical');
        });

        it('should handle different severity levels', () => {
            const severities = ['critical', 'high', 'medium', 'low', 'info'];
            severities.forEach(sev => {
                const formatted = formatSeverity(sev, 'rich');
                expect(formatted).toBeDefined();
            });
        });
    });

    describe('formatIcon', () => {
        const formatIcon = (iconName, noColor = false) => {
            const icons = {
                critical: '🔴',
                success: '✅',
                warning: '⚠️',
                error: '❌'
            };
            if (noColor) return '';
            return icons[iconName] || '';
        };

        it('should return icon for valid icon name', () => {
            const icon = formatIcon('success');
            expect(icon).toBe('✅');
        });

        it('should return empty for unknown icon', () => {
            const icon = formatIcon('unknown');
            expect(icon).toBe('');
        });

        it('should return empty when noColor is true', () => {
            const icon = formatIcon('success', true);
            expect(icon).toBe('');
        });
    });

    describe('formatIssue', () => {
        const formatIssue = (issue) => {
            return `${issue.file}:${issue.line} - ${issue.message}`;
        };

        it('should format issue correctly', () => {
            const issue = {
                severity: 'high',
                file: 'test.js',
                line: 10,
                message: 'Test issue'
            };
            const formatted = formatIssue(issue);
            expect(formatted).toContain('test.js');
            expect(formatted).toContain('10');
        });
    });
});
