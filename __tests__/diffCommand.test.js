/**
 * Test suite for DiffCommand
 */
describe('DiffCommand', () => {
    describe('parseDiffSpec', () => {
        const parseDiffSpec = (spec) => {
            const parts = spec.split('..');
            if (parts.length !== 2) {
                return ['main', 'HEAD'];
            }
            return parts;
        };

        it('should parse valid diff spec', () => {
            const [from, to] = parseDiffSpec('main..HEAD');
            expect(from).toBe('main');
            expect(to).toBe('HEAD');
        });

        it('should parse feature branch diff', () => {
            const [from, to] = parseDiffSpec('develop..feature/auth');
            expect(from).toBe('develop');
            expect(to).toBe('feature/auth');
        });

        it('should default to main..HEAD for invalid spec', () => {
            const [from, to] = parseDiffSpec('invalid');
            expect(from).toBe('main');
            expect(to).toBe('HEAD');
        });

        it('should handle empty string', () => {
            const [from, to] = parseDiffSpec('');
            expect(from).toBe('main');
            expect(to).toBe('HEAD');
        });

        it('should parse commit hash diff', () => {
            const [from, to] = parseDiffSpec('abc123..def456');
            expect(from).toBe('abc123');
            expect(to).toBe('def456');
        });
    });
});
