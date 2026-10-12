import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import * as prettier from 'prettier';
import { changedFiles } from './git.mjs';

export const isFormattable = (info) => !info.ignored && info.inferredParser !== null;

export const run = async ({ files, write }) => {
  const unformatted = [];
  for (const file of files) {
    const info = await prettier.getFileInfo(file, { ignorePath: '.prettierignore' });
    if (!isFormattable(info)) continue;
    const source = readFileSync(file, 'utf8');
    const options = { ...(await prettier.resolveConfig(file)), filepath: file };
    if (await prettier.check(source, options)) continue;
    if (write) writeFileSync(file, await prettier.format(source, options));
    else unformatted.push(file);
  }
  unformatted.forEach((file) => console.error(`not formatted: ${file}`));
  return unformatted.length === 0 ? 0 : 1;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const write = process.argv.includes('--write');
  const code = await run({ files: changedFiles(), write });
  if (code === 0) console.log('format: every changed file matches Prettier.');
  else console.error('Run npm run format to fix the files above.');
  process.exit(code);
}
