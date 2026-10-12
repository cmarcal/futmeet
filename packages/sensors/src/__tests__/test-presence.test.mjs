import { describe, expect, it } from 'vitest';
import { findMissingTests, testCandidates } from '../test-presence.mjs';

const find = (files, existing = [], contents = {}) =>
  findMissingTests({
    files,
    exists: (path) => existing.includes(path),
    read: (path) => contents[path] ?? 'export const value = 1;',
  });

describe('testCandidates', () => {
  it('lists sibling and __tests__ locations for ts and tsx', () => {
    expect(testCandidates('apps/api/src/core/logger/index.ts')).toEqual([
      'apps/api/src/core/logger/index.test.ts',
      'apps/api/src/core/logger/__tests__/index.test.ts',
      'apps/api/src/core/logger/index.test.tsx',
      'apps/api/src/core/logger/__tests__/index.test.tsx',
    ]);
  });
});

describe('findMissingTests', () => {
  it('flags a changed source file without a test', () => {
    const result = find(['apps/api/src/modules/room/service/index.ts']);
    expect(result.missingTests).toEqual(['apps/api/src/modules/room/service/index.ts']);
  });

  it('accepts a test in __tests__ next to the source', () => {
    const result = find(
      ['apps/api/src/modules/room/service/index.ts'],
      ['apps/api/src/modules/room/service/__tests__/index.test.ts']
    );
    expect(result.missingTests).toEqual([]);
  });

  it('accepts a sibling test file', () => {
    const result = find(
      ['apps/web/src/utils/teamSorter.ts'],
      ['apps/web/src/utils/teamSorter.test.ts']
    );
    expect(result.missingTests).toEqual([]);
  });

  it('ignores test files, declarations, migrations and non-source paths', () => {
    const result = find([
      'apps/api/src/modules/room/service/__tests__/index.test.ts',
      'apps/web/src/vite-env.d.ts',
      'apps/api/src/migrations/20260315_03_create_games.ts',
      'apps/web/src/main.tsx',
      'README.md',
      'packages/sensors/src/verify.mjs',
    ]);
    expect(result.missingTests).toEqual([]);
  });

  it('skips barrel index files that only re-export', () => {
    const file = 'apps/web/src/components/Button/index.ts';
    const result = find([file], [], {
      [file]: "export { Button } from './Button';\nexport type { ButtonProps } from './Button';\n",
    });
    expect(result.missingTests).toEqual([]);
  });

  it('requires tests for index files that contain logic', () => {
    const file = 'apps/api/src/core/logger/index.ts';
    const result = find([file], [], { [file]: 'export const logger = createLogger();\n' });
    expect(result.missingTests).toEqual([file]);
  });

  it('requires an a11y test for a changed web component', () => {
    const file = 'apps/web/src/components/Alert/Alert.tsx';
    const result = find([file], ['apps/web/src/components/Alert/Alert.test.tsx']);
    expect(result.missingTests).toEqual([]);
    expect(result.missingA11y).toEqual([file]);
  });

  it('accepts a component with unit and a11y tests', () => {
    const file = 'apps/web/src/components/Alert/Alert.tsx';
    const result = find(
      [file],
      [
        'apps/web/src/components/Alert/Alert.test.tsx',
        'apps/web/src/components/Alert/Alert.a11y.test.tsx',
      ]
    );
    expect(result).toEqual({ missingTests: [], missingA11y: [] });
  });
});
