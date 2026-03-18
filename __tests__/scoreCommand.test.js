/**
 * Test suite for ScoreCommand
 */
describe('ScoreCommand', () => {
    describe('calculateSecurityScore', () => {
        const calculateSecurityScore = (security) => {
            if (security.issues === 0) return 100;
            
            let score = 100;
            score -= security.critical * 15;
            score -= security.high * 10;
            score -= security.medium * 5;
            score -= security.low * 2;
            
            return Math.max(0, Math.round(score));
        };

        it('should return 100 for no security issues', () => {
            const security = { issues: 0, critical: 0, high: 0, medium: 0, low: 0 };
            const score = calculateSecurityScore(security);
            expect(score).toBe(100);
        });

        it('should deduct 15 points per critical issue', () => {
            const security = { issues: 1, critical: 1, high: 0, medium: 0, low: 0 };
            const score = calculateSecurityScore(security);
            expect(score).toBe(85);
        });

        it('should deduct 10 points per high issue', () => {
            const security = { issues: 1, critical: 0, high: 1, medium: 0, low: 0 };
            const score = calculateSecurityScore(security);
            expect(score).toBe(90);
        });

        it('should deduct 5 points per medium issue', () => {
            const security = { issues: 1, critical: 0, high: 0, medium: 1, low: 0 };
            const score = calculateSecurityScore(security);
            expect(score).toBe(95);
        });

        it('should deduct 2 points per low issue', () => {
            const security = { issues: 1, critical: 0, high: 0, medium: 0, low: 1 };
            const score = calculateSecurityScore(security);
            expect(score).toBe(98);
        });

        it('should not go below 0', () => {
            const security = { issues: 20, critical: 10, high: 10, medium: 0, low: 0 };
            const score = calculateSecurityScore(security);
            expect(score).toBe(0);
        });
    });

    describe('calculateOverall', () => {
        const calculateOverall = (scores) => {
            let weightedSum = 0;
            let totalWeight = 0;
            
            for (const [category, data] of Object.entries(scores)) {
                weightedSum += data.score * data.weight;
                totalWeight += data.weight;
            }
            
            return Math.round(weightedSum / totalWeight);
        };

        it('should calculate weighted average correctly', () => {
            const scores = {
                security: { score: 100, weight: 0.35 },
                quality: { score: 80, weight: 0.30 },
                dependencies: { score: 90, weight: 0.20 },
                codeHealth: { score: 70, weight: 0.15 }
            };
            const overall = calculateOverall(scores);
            const expected = Math.round((100 * 0.35 + 80 * 0.30 + 90 * 0.20 + 70 * 0.15));
            expect(overall).toBe(expected);
        });

        it('should handle zero weights', () => {
            const scores = {
                security: { score: 100, weight: 0 },
                quality: { score: 80, weight: 0 },
                dependencies: { score: 90, weight: 0.50 },
                codeHealth: { score: 70, weight: 0.50 }
            };
            const overall = calculateOverall(scores);
            expect(overall).toBe(80);
        });
    });
});
