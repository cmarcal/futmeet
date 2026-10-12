import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const ASSETS_DIR = 'apps/web/dist/assets';
const BUDGET_FILE = new URL('../bundle-budget.json', import.meta.url);

const kb = (bytes) => Math.round((bytes / 1024) * 100) / 100;
const sum = (list) => list.reduce((total, asset) => total + asset.gzipBytes, 0);

export const checkBudget = ({ assets, budget }) => {
  const js = assets.filter((asset) => asset.name.endsWith('.js'));
  const css = assets.filter((asset) => asset.name.endsWith('.css'));
  if (js.length === 0) return ['no JS assets found; run the build first'];
  const entry = js.find((asset) => asset.name.startsWith('index-'));
  const problems = [];
  if (entry && kb(entry.gzipBytes) > budget.maxEntryJsKb)
    problems.push(
      `entry ${entry.name} is ${kb(entry.gzipBytes)} kB gzip, budget ${budget.maxEntryJsKb} kB`
    );
  js.filter((asset) => kb(asset.gzipBytes) > budget.maxChunkJsKb).forEach((asset) =>
    problems.push(
      `chunk ${asset.name} is ${kb(asset.gzipBytes)} kB gzip, budget ${budget.maxChunkJsKb} kB`
    )
  );
  if (kb(sum(js)) > budget.maxTotalJsKb)
    problems.push(`total JS is ${kb(sum(js))} kB gzip, budget ${budget.maxTotalJsKb} kB`);
  if (kb(sum(css)) > budget.maxTotalCssKb)
    problems.push(`total CSS is ${kb(sum(css))} kB gzip, budget ${budget.maxTotalCssKb} kB`);
  return problems;
};

export const run = () => {
  const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));
  const assets = readdirSync(ASSETS_DIR).map((name) => ({
    name,
    gzipBytes: gzipSync(readFileSync(join(ASSETS_DIR, name))).length,
  }));
  const problems = checkBudget({ assets, budget });
  problems.forEach((problem) => console.error(problem));
  return problems.length === 0 ? 0 : 1;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = run();
  if (code === 0) console.log('bundle-budget: web bundle is within budget.');
  process.exit(code);
}
