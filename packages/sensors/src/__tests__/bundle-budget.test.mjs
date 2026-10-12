import { describe, expect, it } from 'vitest';
import { checkBudget } from '../bundle-budget.mjs';

const budget = { maxEntryJsKb: 100, maxChunkJsKb: 50, maxTotalJsKb: 120, maxTotalCssKb: 10 };
const kb = (value) => value * 1024;
const asset = (name, size) => ({ name, gzipBytes: kb(size) });

describe('checkBudget', () => {
  it('passes when every limit holds', () => {
    const assets = [asset('index-abc.js', 40), asset('Home-abc.js', 20), asset('index-abc.css', 5)];
    expect(checkBudget({ assets, budget })).toEqual([]);
  });

  it('reports when there is no JS output', () => {
    expect(checkBudget({ assets: [asset('index-abc.css', 1)], budget })).toEqual([
      'no JS assets found; run the build first',
    ]);
  });

  it('flags an entry bundle over budget', () => {
    const problems = checkBudget({
      assets: [asset('index-abc.js', 101)],
      budget: { ...budget, maxChunkJsKb: 200, maxTotalJsKb: 200 },
    });
    expect(problems).toEqual(['entry index-abc.js is 101 kB gzip, budget 100 kB']);
  });

  it('flags a single chunk over budget', () => {
    const problems = checkBudget({
      assets: [asset('index-abc.js', 10), asset('Stats-abc.js', 60)],
      budget,
    });
    expect(problems).toEqual(['chunk Stats-abc.js is 60 kB gzip, budget 50 kB']);
  });

  it('flags total JS over budget', () => {
    const assets = [asset('index-abc.js', 45), asset('A-abc.js', 45), asset('B-abc.js', 45)];
    expect(checkBudget({ assets, budget })).toEqual(['total JS is 135 kB gzip, budget 120 kB']);
  });

  it('flags total CSS over budget', () => {
    const assets = [asset('index-abc.js', 10), asset('a.css', 6), asset('b.css', 6)];
    expect(checkBudget({ assets, budget })).toEqual(['total CSS is 12 kB gzip, budget 10 kB']);
  });
});
