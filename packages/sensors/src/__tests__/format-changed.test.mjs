import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isFormattable, run } from '../format-changed.mjs';

describe('isFormattable', () => {
  it('accepts supported files that are not ignored', () => {
    expect(isFormattable({ ignored: false, inferredParser: 'typescript' })).toBe(true);
  });

  it('rejects ignored files', () => {
    expect(isFormattable({ ignored: true, inferredParser: 'typescript' })).toBe(false);
  });

  it('rejects files without a parser', () => {
    expect(isFormattable({ ignored: false, inferredParser: null })).toBe(false);
  });
});

describe('run', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'format-'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('returns 0 for a formatted file', async () => {
    const file = join(dir, 'ok.json');
    writeFileSync(file, '{ "a": 1 }\n');
    expect(await run({ files: [file], write: false })).toBe(0);
  });

  it('returns 1 and reports an unformatted file', async () => {
    const file = join(dir, 'bad.json');
    writeFileSync(file, '{"a":1,\n"b":2}');
    expect(await run({ files: [file], write: false })).toBe(1);
    expect(console.error).toHaveBeenCalledWith(`not formatted: ${file}`);
  });

  it('rewrites the file and returns 0 in write mode', async () => {
    const file = join(dir, 'fix.json');
    writeFileSync(file, '{"a":1,\n"b":2}');
    expect(await run({ files: [file], write: true })).toBe(0);
    expect(readFileSync(file, 'utf8')).toBe('{ "a": 1, "b": 2 }\n');
  });

  it('skips files prettier cannot parse', async () => {
    const file = join(dir, 'data.unknownext');
    writeFileSync(file, 'anything   goes');
    expect(await run({ files: [file], write: false })).toBe(0);
  });
});
