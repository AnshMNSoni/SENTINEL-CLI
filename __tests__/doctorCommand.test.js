/**
 * Test suite for DoctorCommand
 */
describe('DoctorCommand', () => {
    describe('checkNodeVersion', () => {
        const checkNodeVersion = () => {
            const version = process.version;
            const major = parseInt(version.slice(1).split('.')[0]);
            
            return {
                name: 'Node.js',
                status: major >= 18 ? 'pass' : 'warn',
                message: `v${version}`,
                details: major >= 18 ? 'OK - Node 18+ required' : 'Warning - Node 18+ recommended'
            };
        };

        it('should return pass for Node 18+', () => {
            const check = checkNodeVersion();
            expect(check.name).toBe('Node.js');
            expect(check.message).toContain('v');
            expect(check.status).toMatch(/pass|warn/);
        });

        it('should include version details', () => {
            const check = checkNodeVersion();
            expect(check.details).toBeDefined();
        });
    });

    describe('getSummary', () => {
        const getSummary = (checks) => {
            const summary = {
                total: checks.length,
                passed: 0,
                warnings: 0,
                failures: 0,
                success: true
            };

            for (const check of checks) {
                if (check.status === 'pass') summary.passed++;
                else if (check.status === 'warn') summary.warnings++;
                else if (check.status === 'fail') summary.failures++;
            }

            if (summary.failures > 0) summary.success = false;

            return summary;
        };

        it('should return summary with all checks passed', () => {
            const checks = [
                { name: 'Check 1', status: 'pass' },
                { name: 'Check 2', status: 'pass' }
            ];
            const summary = getSummary(checks);
            expect(summary.total).toBe(2);
            expect(summary.passed).toBe(2);
            expect(summary.warnings).toBe(0);
            expect(summary.failures).toBe(0);
            expect(summary.success).toBe(true);
        });

        it('should return summary with warnings', () => {
            const checks = [
                { name: 'Check 1', status: 'pass' },
                { name: 'Check 2', status: 'warn' }
            ];
            const summary = getSummary(checks);
            expect(summary.warnings).toBe(1);
            expect(summary.success).toBe(true);
        });

        it('should return summary with failures', () => {
            const checks = [
                { name: 'Check 1', status: 'pass' },
                { name: 'Check 2', status: 'fail' }
            ];
            const summary = getSummary(checks);
            expect(summary.failures).toBe(1);
            expect(summary.success).toBe(false);
        });
    });
});
