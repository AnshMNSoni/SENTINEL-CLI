/**
 * Test suite for WatchCommand
 */
describe('WatchCommand', () => {
    const ignorePatterns = [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.git/**',
        'coverage/**',
        '*.log',
        '.sentinel/**'
    ];

    const shouldIgnore = (filePath) => {
        for (const pattern of ignorePatterns) {
            if (pattern.includes('**')) {
                const prefix = pattern.replace('/**', '');
                if (filePath.startsWith(prefix) || filePath.includes('/' + prefix)) {
                    return true;
                }
            } else if (pattern.startsWith('*.')) {
                const ext = pattern.slice(1);
                if (filePath.endsWith(ext)) {
                    return true;
                }
            } else if (filePath.includes(pattern)) {
                return true;
            }
        }
        return false;
    };

    const isRelevantFile = (filePath) => {
        const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.kt', '.swift', '.php', '.c', '.cpp'];
        return relevantExtensions.some(ext => filePath.endsWith(ext));
    };

    describe('shouldIgnore', () => {
        it('should ignore node_modules files', () => {
            expect(shouldIgnore('node_modules/pkg/index.js')).toBe(true);
        });

        it('should ignore dist files', () => {
            expect(shouldIgnore('dist/bundle.js')).toBe(true);
        });

        it('should ignore git files', () => {
            expect(shouldIgnore('.git/config')).toBe(true);
        });

        it('should not ignore source files', () => {
            expect(shouldIgnore('src/index.js')).toBe(false);
            expect(shouldIgnore('lib/utils.ts')).toBe(false);
        });

        it('should ignore log files', () => {
            expect(shouldIgnore('error.log')).toBe(true);
        });
    });

    describe('isRelevantFile', () => {
        it('should recognize JavaScript files', () => {
            expect(isRelevantFile('app.js')).toBe(true);
            expect(isRelevantFile('component.jsx')).toBe(true);
        });

        it('should recognize TypeScript files', () => {
            expect(isRelevantFile('app.ts')).toBe(true);
            expect(isRelevantFile('component.tsx')).toBe(true);
        });

        it('should recognize Python files', () => {
            expect(isRelevantFile('main.py')).toBe(true);
        });

        it('should recognize Java files', () => {
            expect(isRelevantFile('Main.java')).toBe(true);
        });

        it('should recognize Go files', () => {
            expect(isRelevantFile('main.go')).toBe(true);
        });

        it('should recognize Rust files', () => {
            expect(isRelevantFile('lib.rs')).toBe(true);
        });

        it('should not recognize non-code files', () => {
            expect(isRelevantFile('README.md')).toBe(false);
            expect(isRelevantFile('config.json')).toBe(false);
        });
    });

    describe('parseArgs', () => {
        const parseArgs = (args, defaultDebounce = 1000) => {
            const options = {
                analyzers: ['security', 'quality', 'bugs'],
                debounce: defaultDebounce,
                silent: false
            };
            
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '--analyzers' && args[i + 1]) {
                    options.analyzers = args[i + 1].split(',');
                    i++;
                } else if (args[i] === '--debounce' && args[i + 1]) {
                    options.debounce = parseInt(args[i + 1]);
                    i++;
                } else if (args[i] === '--silent') {
                    options.silent = true;
                }
            }
            
            return options;
        };

        it('should parse analyzers option', () => {
            const options = parseArgs(['--analyzers', 'security,quality']);
            expect(options.analyzers).toEqual(['security', 'quality']);
        });

        it('should parse debounce option', () => {
            const options = parseArgs(['--debounce', '2000']);
            expect(options.debounce).toBe(2000);
        });

        it('should parse silent option', () => {
            const options = parseArgs(['--silent']);
            expect(options.silent).toBe(true);
        });

        it('should use default values when no args provided', () => {
            const options = parseArgs([]);
            expect(options.analyzers).toEqual(['security', 'quality', 'bugs']);
            expect(options.debounce).toBe(1000);
            expect(options.silent).toBe(false);
        });

        it('should handle multiple options', () => {
            const options = parseArgs(['--analyzers', 'security', '--debounce', '500', '--silent']);
            expect(options.analyzers).toEqual(['security']);
            expect(options.debounce).toBe(500);
            expect(options.silent).toBe(true);
        });
    });
});
