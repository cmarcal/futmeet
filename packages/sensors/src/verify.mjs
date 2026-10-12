import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const SENSORS = [
  'lint',
  'typecheck',
  'format:check',
  'knip',
  'skills:lint',
  'test:presence',
  'secrets',
  'audit:prod',
  'test',
  'build',
  'bundle',
];
export const DB_SENSORS = ['db:check'];

export const selectSensors = (env) => (env.VERIFY_DB ? [...SENSORS, ...DB_SENSORS] : SENSORS);

export const summarize = (results) => ({
  red: results.filter(({ green }) => !green).map(({ name }) => name),
});

export const nodeMismatch = (nvmrc, current) => {
  const wanted = nvmrc.trim();
  return current.split('.')[0] === wanted ? null : wanted;
};

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const runSensor = (name) => {
  console.log(`\n=== sensor: ${name} ===`);
  const started = Date.now();
  const { status } = spawnSync(npm, ['run', name], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return { name, green: status === 0, seconds: Math.round((Date.now() - started) / 1000) };
};

const main = () => {
  const wanted = nodeMismatch(
    readFileSync(new URL('../../../.nvmrc', import.meta.url), 'utf8'),
    process.versions.node
  );
  if (wanted) {
    console.warn(
      `WARNING: running Node ${process.versions.node} but .nvmrc pins ${wanted}. Red results may come from the Node version; switch with nvm before debugging code.`
    );
  }

  const results = selectSensors(process.env).map(runSensor);

  console.log('\n=== verify summary ===');
  results.forEach(({ name, green, seconds }) => {
    console.log(`${green ? 'GREEN' : 'RED  '}  ${name} (${seconds}s)`);
  });

  const { red } = summarize(results);
  if (red.length > 0) {
    console.error(
      `\nverify failed: ${red.join(', ')} red. Fix the cause, then rerun npm run verify.`
    );
    process.exit(1);
  }
  console.log('\nverify passed: all sensors green.');
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
