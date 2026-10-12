import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn() }));
vi.mock('node:child_process', () => ({ execFileSync }));

import { changedFiles, trackedFiles } from '../git.mjs';

describe('git helpers', () => {
  beforeEach(() => {
    execFileSync.mockReset();
  });

  it('diffs against the merge base with origin/main and adds untracked files', () => {
    execFileSync.mockImplementation((_cmd, args) => {
      if (args[0] === 'merge-base') return 'abc123\n';
      if (args[0] === 'diff') return 'a.ts\nb.ts\n';
      return 'b.ts\nc.ts\n';
    });
    expect(changedFiles()).toEqual(['a.ts', 'b.ts', 'c.ts']);
    expect(execFileSync).toHaveBeenCalledWith(
      'git',
      ['diff', '--name-only', '--diff-filter=AM', 'abc123'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
  });

  it('falls back to main, then HEAD, when origin/main is missing', () => {
    execFileSync.mockImplementation((_cmd, args) => {
      if (args[0] === 'merge-base') throw new Error('no ref');
      return '';
    });
    expect(changedFiles()).toEqual([]);
    expect(execFileSync).toHaveBeenCalledWith(
      'git',
      ['diff', '--name-only', '--diff-filter=AM', 'HEAD'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
  });

  it('lists tracked files', () => {
    execFileSync.mockReturnValue('x.ts\ny.ts\n');
    expect(trackedFiles()).toEqual(['x.ts', 'y.ts']);
  });
});
