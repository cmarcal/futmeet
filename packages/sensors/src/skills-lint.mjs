import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_LINES = 100;
const SKILLS_DIR = '.claude/skills';

export const parseFrontmatter = (content) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (!match) return {};
  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => /^([a-z-]+):\s*(.*)$/.exec(line))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.trim()])
  );
};

export const lintSkill = ({ dir, content, exists }) => {
  const problems = [];
  const { name, description } = parseFrontmatter(content);
  const lines = content.replace(/\r?\n$/, '').split(/\r?\n/).length;
  if (name !== dir) problems.push(`frontmatter name "${name}" must equal folder "${dir}"`);
  if (!description) problems.push('missing description');
  else if (!description.startsWith('Use when'))
    problems.push('description must start with "Use when"');
  if (lines > MAX_LINES)
    problems.push(`${lines} lines, limit is ${MAX_LINES}; move detail to references/`);
  [...content.matchAll(/`(references\/[^`\s]+\.md)`/g)]
    .map(([, path]) => path)
    .filter((path) => !exists(`${SKILLS_DIR}/${dir}/${path}`))
    .forEach((path) => problems.push(`broken reference: ${path}`));
  return problems;
};

export const lintIndex = ({ skills, claudeMd }) => {
  const rows = claudeMd.split('\n').filter((line) => line.startsWith('|'));
  const mentioned = new Set(
    rows.flatMap((row) => [...row.matchAll(/`([a-z0-9-]+)`/g)].map(([, name]) => name))
  );
  return [
    ...skills
      .filter((skill) => !mentioned.has(skill))
      .map((skill) => `CLAUDE.md skill table is missing: ${skill}`),
    ...[...mentioned]
      .filter((name) => !skills.includes(name))
      .map((name) => `CLAUDE.md skill table names unknown skill: ${name}`),
  ];
};

export const run = () => {
  const skills = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const problems = skills.flatMap((dir) => {
    const file = join(SKILLS_DIR, dir, 'SKILL.md');
    if (!existsSync(file)) return [`${dir}: SKILL.md is missing`];
    return lintSkill({ dir, content: readFileSync(file, 'utf8'), exists: existsSync }).map(
      (problem) => `${dir}: ${problem}`
    );
  });
  problems.push(...lintIndex({ skills, claudeMd: readFileSync('CLAUDE.md', 'utf8') }));
  problems.forEach((problem) => console.error(problem));
  return problems.length === 0 ? 0 : 1;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = run();
  if (code === 0) console.log('skills-lint: all skills and the CLAUDE.md index are consistent.');
  process.exit(code);
}
