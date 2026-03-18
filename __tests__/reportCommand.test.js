/**
 * Test suite for ReportCommand
 */
import { ReportCommand } from '../src/commands/reportCommand.js';

describe('ReportCommand', () => {
    let command;

    beforeEach(() => {
        command = new ReportCommand({ projectPath: process.cwd() });
    });

    describe('constructor', () => {
        it('should accept custom project path', () => {
            const customCommand = new ReportCommand({ projectPath: '/custom/path' });
            expect(customCommand.projectPath).toBe('/custom/path');
        });

        it('should default to current working directory', () => {
            expect(command.projectPath).toBe(process.cwd());
        });
    });

    describe('parseFormat', () => {
        it('should parse html format', () => {
            expect(command.parseFormat(['html'])).toBe('html');
        });

        it('should parse markdown format', () => {
            expect(command.parseFormat(['markdown'])).toBe('markdown');
        });

        it('should parse json format', () => {
            expect(command.parseFormat(['json'])).toBe('json');
        });

        it('should parse csv format', () => {
            expect(command.parseFormat(['csv'])).toBe('csv');
        });

        it('should parse junit format', () => {
            expect(command.parseFormat(['junit'])).toBe('junit');
        });

        it('should parse sarif format', () => {
            expect(command.parseFormat(['sarif'])).toBe('sarif');
        });

        it('should default to html for unknown format', () => {
            expect(command.parseFormat(['unknown'])).toBe('html');
        });

        it('should default to html for empty args', () => {
            expect(command.parseFormat([])).toBe('html');
        });

        it('should be case insensitive', () => {
            expect(command.parseFormat(['JSON'])).toBe('json');
            expect(command.parseFormat(['HTML'])).toBe('html');
        });
    });

    describe('parseOptions', () => {
        it('should parse output option', () => {
            const options = command.parseOptions(['--output', 'report.html']);
            expect(options.output).toBe('report.html');
        });

        it('should parse short output option', () => {
            const options = command.parseOptions(['-o', 'report.json']);
            expect(options.output).toBe('report.json');
        });

        it('should parse analyzers option', () => {
            const options = command.parseOptions(['--analyzers', 'security,quality']);
            expect(options.analyzers).toEqual(['security', 'quality']);
        });

        it('should parse min-severity option', () => {
            const options = command.parseOptions(['--min-severity', 'high']);
            expect(options.minSeverity).toBe('high');
        });

        it('should use default values when no options provided', () => {
            const options = command.parseOptions([]);
            expect(options.analyzers).toEqual(['security', 'quality', 'bugs', 'dependency']);
            expect(options.output).toBeNull();
            expect(options.minSeverity).toBe('low');
        });

        it('should handle multiple options', () => {
            const options = command.parseOptions([
                '--output', 'report.html',
                '--analyzers', 'security',
                '--min-severity', 'critical'
            ]);
            expect(options.output).toBe('report.html');
            expect(options.analyzers).toEqual(['security']);
            expect(options.minSeverity).toBe('critical');
        });
    });
});
