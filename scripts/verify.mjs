import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const sensors = ['lint', 'typecheck', 'test', 'build'];
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const wantedNode = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim();
const currentNode = process.versions.node.split('.')[0];
if (currentNode !== wantedNode) {
  console.warn(`WARNING: running Node ${process.versions.node} but .nvmrc pins ${wantedNode}. Red results may come from the Node version; switch with nvm before debugging code.`);
}

const results = sensors.map((name) => {
  console.log(`\n=== sensor: ${name} ===`);
  const started = Date.now();
  const { status } = spawnSync(npm, ['run', name], { stdio: 'inherit', shell: process.platform === 'win32' });
  return { name, green: status === 0, seconds: Math.round((Date.now() - started) / 1000) };
});

console.log('\n=== verify summary ===');
results.forEach(({ name, green, seconds }) => {
  console.log(`${green ? 'GREEN' : 'RED  '}  ${name} (${seconds}s)`);
});

const red = results.filter(({ green }) => !green).map(({ name }) => name);
if (red.length > 0) {
  console.error(`\nverify failed: ${red.join(', ')} red. Fix the cause, then rerun npm run verify.`);
  process.exit(1);
}
console.log('\nverify passed: all sensors green.');
