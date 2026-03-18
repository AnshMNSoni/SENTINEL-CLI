/**
 * Test suite for InteractiveFixCommand
 */
import { InteractiveFixCommand } from '../src/commands/interactiveFixCommand.js';

describe('InteractiveFixCommand', () => {
    let command;

    beforeEach(() => {
        command = new InteractiveFixCommand({ projectPath: process.cwd() });
    });

    describe('constructor', () => {
        it('should accept custom project path', () => {
            const customCommand = new InteractiveFixCommand({ projectPath: '/custom/path' });
            expect(customCommand.projectPath).toBe('/custom/path');
        });

        it('should default to current working directory', () => {
            expect(command.projectPath).toBe(process.cwd());
        });

        it('should initialize issues array', () => {
            expect(command.issues).toEqual([]);
        });

        it('should initialize current index to 0', () => {
            expect(command.currentIndex).toBe(0);
        });

        it('should initialize applied, skipped, edited arrays', () => {
            expect(command.applied).toEqual([]);
            expect(command.skipped).toEqual([]);
            expect(command.edited).toEqual([]);
        });
    });

    describe('parseArgs', () => {
        it('should parse dry-run option', () => {
            const options = command.parseArgs(['--dry-run']);
            expect(options.dryRun).toBe(true);
        });

        it('should parse short dry-run option', () => {
            const options = command.parseArgs(['-n']);
            expect(options.dryRun).toBe(true);
        });

        it('should parse all option', () => {
            const options = command.parseArgs(['--all']);
            expect(options.applyAll).toBe(true);
        });

        it('should default interactive to true', () => {
            const options = command.parseArgs([]);
            expect(options.interactive).toBe(true);
        });

        it('should default applyAll to false', () => {
            const options = command.parseArgs([]);
            expect(options.applyAll).toBe(false);
        });

        it('should default dryRun to false', () => {
            const options = command.parseArgs([]);
            expect(options.dryRun).toBe(false);
        });
    });

    describe('applyFixToContent', () => {
        it('should handle replace fix type', () => {
            const content = 'const x = 1;';
            const issue = {
                fix: {
                    type: 'replace',
                    pattern: 'const x = 1;',
                    replacement: 'const x = 2;'
                }
            };
            const result = command.applyFixToContent(content, issue);
            expect(result).toBe('const x = 2;');
        });

        it('should handle remove fix type', () => {
            const content = 'const x = 1;\nconsole.log(x);';
            const issue = {
                fix: {
                    type: 'remove',
                    pattern: 'console.log(x);',
                    replacement: ''
                }
            };
            const result = command.applyFixToContent(content, issue);
            expect(result).toBe('const x = 1;\n');
        });

        it('should return original content for unknown fix type', () => {
            const content = 'const x = 1;';
            const issue = { fix: { type: 'unknown' } };
            const result = command.applyFixToContent(content, issue);
            expect(result).toBe(content);
        });
    });
});
