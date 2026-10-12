import { execFileSync } from 'node:child_process';

const git = (args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const baseCommit = () => {
  for (const ref of ['origin/main', 'main']) {
    try {
      return git(['merge-base', 'HEAD', ref])[0];
    } catch {
      continue;
    }
  }
  return 'HEAD';
};

export const changedFiles = () => [
  ...new Set([
    ...git(['diff', '--name-only', '--diff-filter=AM', baseCommit()]),
    ...git(['ls-files', '--others', '--exclude-standard']),
  ]),
];

export const trackedFiles = () => git(['ls-files']);
