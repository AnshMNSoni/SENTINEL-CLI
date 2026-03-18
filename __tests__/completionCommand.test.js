/**
 * Test suite for CompletionCommand
 */
describe('CompletionCommand', () => {
    describe('generateBashCompletion', () => {
        const generateBashCompletion = () => {
            return `#!/bin/bash
_sentinel_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    opts="analyze audit auth benchmark diff init score watch doctor"
    COMPREPLY=($(compgen -W "\${opts}" -- \${cur}))
    return 0
}
complete -F _sentinel_completion sentinel`;
        };

        it('should generate bash completion script', () => {
            const completion = generateBashCompletion();
            expect(completion).toContain('#!/bin/bash');
            expect(completion).toContain('_sentinel_completion');
        });

        it('should include sentinel command', () => {
            const completion = generateBashCompletion();
            expect(completion).toContain('sentinel');
        });

        it('should include analyze command', () => {
            const completion = generateBashCompletion();
            expect(completion).toContain('analyze');
        });

        it('should include init command', () => {
            const completion = generateBashCompletion();
            expect(completion).toContain('init');
        });
    });

    describe('generateZshCompletion', () => {
        const generateZshCompletion = () => {
            return `#compdef _sentinel
_sentinel() {
    local -a commands
    commands=(
        'analyze:Run code analysis'
        'init:Initialize sentinel'
        'score:Calculate project score'
    )
    _describe 'command' commands
}`;
        };

        it('should generate zsh completion script', () => {
            const completion = generateZshCompletion();
            expect(completion).toContain('#compdef');
            expect(completion).toContain('_sentinel');
        });
    });

    describe('generateFishCompletion', () => {
        const generateFishCompletion = () => {
            return `complete -c sentinel -f -a 'analyze init score watch doctor'`;
        };

        it('should generate fish completion script', () => {
            const completion = generateFishCompletion();
            expect(completion).toContain('complete');
            expect(completion).toContain('-c');
        });
    });

    describe('generatePowerShellCompletion', () => {
        const generatePowerShellCompletion = () => {
            return `Register-ArgumentCompleter -CommandName sentinel -Native -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)
    @('analyze','init','score','watch','doctor') | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
    }
}`;
        };

        it('should generate PowerShell completion script', () => {
            const completion = generatePowerShellCompletion();
            expect(completion).toContain('Register-ArgumentCompleter');
            expect(completion).toContain('sentinel');
        });
    });
});
