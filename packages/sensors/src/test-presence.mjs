import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { changedFiles, trackedFiles } from './git.mjs';

const SOURCE = /^(apps|packages)\/[^/]+\/src\/.+\.tsx?$/;
const EXEMPT = [
  /\.d\.ts$/,
  /\.(test|spec)\.tsx?$/,
  /(^|\/)__tests__\//,
  /\/test\//,
  /\/migrations\//,
  /\/seeds\//,
  /\/scripts\//,
  /\/(types|entity)\//,
  /\/src\/(main|vite-env)\.tsx?$/,
];
const COMPONENT = /^apps\/web\/src\/components\/([^/]+)\/\1\.tsx$/;

const isBarrel = (content) =>
  content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'))
    .every((line) => /^export\s.*\sfrom\s/.test(line));

const splitPath = (file) => {
  const slash = file.lastIndexOf('/');
  return { dir: file.slice(0, slash), base: file.slice(slash + 1).replace(/\.tsx?$/, '') };
};

export const testCandidates = (file) => {
  const { dir, base } = splitPath(file);
  return ['ts', 'tsx'].flatMap((ext) => [
    `${dir}/${base}.test.${ext}`,
    `${dir}/__tests__/${base}.test.${ext}`,
  ]);
};

export const findMissingTests = ({ files, exists, read }) => {
  const sources = files.filter(
    (file) => SOURCE.test(file) && !EXEMPT.some((pattern) => pattern.test(file))
  );
  const missingTests = sources.filter((file) => {
    if (/\/index\.tsx?$/.test(file) && isBarrel(read(file))) return false;
    return !testCandidates(file).some(exists);
  });
  const missingA11y = sources.filter((file) => {
    if (!COMPONENT.test(file)) return false;
    const { dir, base } = splitPath(file);
    return !exists(`${dir}/${base}.a11y.test.tsx`);
  });
  return { missingTests, missingA11y };
};

export const run = (files) => {
  const { missingTests, missingA11y } = findMissingTests({
    files,
    exists: existsSync,
    read: (file) => readFileSync(file, 'utf8'),
  });
  missingTests.forEach((file) => console.error(`missing unit test: ${file}`));
  missingA11y.forEach((file) => console.error(`missing a11y test (*.a11y.test.tsx): ${file}`));
  return missingTests.length + missingA11y.length === 0 ? 0 : 1;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = process.argv.includes('--all') ? trackedFiles() : changedFiles();
  const code = run(files);
  if (code === 0) console.log('test-presence: every changed source file has its tests.');
  process.exit(code);
}
