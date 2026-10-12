import { describe, expect, it } from 'vitest';
import { decide, isPrCreate, parseHookInput } from '../pr-gate-hook.mjs';

describe('isPrCreate', () => {
  it('matches a plain gh pr create', () => {
    expect(isPrCreate('gh pr create --title "x"')).toBe(true);
  });

  it('matches gh pr create after another command', () => {
    expect(isPrCreate('git push -u origin feat/x && gh pr create --fill')).toBe(true);
    expect(isPrCreate('echo done; gh pr create')).toBe(true);
  });

  it('ignores other gh pr commands and unrelated commands', () => {
    expect(isPrCreate('gh pr view 61')).toBe(false);
    expect(isPrCreate('gh pr checks 61')).toBe(false);
    expect(isPrCreate('node server.js & curl localhost:3001')).toBe(false);
    expect(isPrCreate('echo "gh pr create" is blocked')).toBe(false);
  });

  it('handles a missing command', () => {
    expect(isPrCreate(undefined)).toBe(false);
  });
});

describe('parseHookInput', () => {
  it('reads command and cwd from the hook payload', () => {
    const raw = JSON.stringify({ tool_input: { command: 'gh pr create' }, cwd: '/repo/apps/api' });
    expect(parseHookInput(raw)).toEqual({ command: 'gh pr create', cwd: '/repo/apps/api' });
  });

  it('falls back to an empty command on invalid JSON', () => {
    expect(parseHookInput('not json').command).toBe('');
  });
});

describe('decide', () => {
  it('allows commands that are not gh pr create without running the gate', () => {
    expect(decide({ command: 'npm run dev', verifyStatus: 1 })).toEqual({ exit: 0, message: '' });
  });

  it('allows gh pr create when every sensor is green', () => {
    expect(decide({ command: 'gh pr create', verifyStatus: 0 })).toEqual({ exit: 0, message: '' });
  });

  it('blocks gh pr create with exit 2 when a sensor is red', () => {
    const result = decide({ command: 'gh pr create', verifyStatus: 1 });
    expect(result.exit).toBe(2);
    expect(result.message).toMatch(/PR gate/);
  });
});
