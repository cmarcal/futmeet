import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const PR_CREATE = /(^|[;&|(]\s*)gh\s+pr\s+create(\s|$)/;

export const isPrCreate = (command) => PR_CREATE.test(command ?? '');

export const parseHookInput = (raw) => {
  try {
    const { tool_input: toolInput, cwd } = JSON.parse(raw);
    return { command: toolInput?.command ?? '', cwd: cwd ?? process.cwd() };
  } catch {
    return { command: '', cwd: process.cwd() };
  }
};

export const decide = ({ command, verifyStatus }) => {
  if (!isPrCreate(command)) return { exit: 0, message: '' };
  if (verifyStatus === 0) return { exit: 0, message: '' };
  return {
    exit: 2,
    message:
      'PR gate: a sensor is red. Fix the cause (pr-gate skill), rerun npm run verify, then open the PR.',
  };
};

const repoRoot = (cwd) => {
  const { stdout } = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd,
    encoding: 'utf8',
  });
  return stdout.trim() || cwd;
};

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
};

const main = async () => {
  const { command, cwd } = parseHookInput(await readStdin());
  if (!isPrCreate(command)) process.exit(0);
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const { status } = spawnSync(npm, ['run', 'verify'], {
    cwd: repoRoot(cwd),
    stdio: ['ignore', process.stderr, process.stderr],
    shell: process.platform === 'win32',
  });
  const { exit, message } = decide({ command, verifyStatus: status });
  if (message) console.error(message);
  process.exit(exit);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
