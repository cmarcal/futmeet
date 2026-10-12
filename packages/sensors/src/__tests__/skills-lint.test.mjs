import { describe, expect, it } from 'vitest';
import { lintIndex, lintSkill, parseFrontmatter } from '../skills-lint.mjs';

const skill = (overrides = {}) => ({
  dir: 'demo-skill',
  content: '---\nname: demo-skill\ndescription: Use when testing.\n---\n\n# Demo\n',
  exists: () => true,
  ...overrides,
});

describe('parseFrontmatter', () => {
  it('reads name and description', () => {
    expect(parseFrontmatter('---\nname: a\ndescription: Use when b.\n---\nbody')).toEqual({
      name: 'a',
      description: 'Use when b.',
    });
  });

  it('returns an empty object without frontmatter', () => {
    expect(parseFrontmatter('# Title')).toEqual({});
  });
});

describe('lintSkill', () => {
  it('accepts a valid skill', () => {
    expect(lintSkill(skill())).toEqual([]);
  });

  it('flags a name that differs from the folder', () => {
    const problems = lintSkill(skill({ dir: 'other' }));
    expect(problems).toEqual(['frontmatter name "demo-skill" must equal folder "other"']);
  });

  it('flags a description that does not start with Use when', () => {
    const content = '---\nname: demo-skill\ndescription: Covers things.\n---\n';
    expect(lintSkill(skill({ content }))).toEqual(['description must start with "Use when"']);
  });

  it('flags a missing description', () => {
    const content = '---\nname: demo-skill\n---\n';
    expect(lintSkill(skill({ content }))).toEqual(['missing description']);
  });

  it('flags skills over 100 lines', () => {
    const content = `---\nname: demo-skill\ndescription: Use when testing.\n---\n${'line\n'.repeat(120)}`;
    expect(lintSkill(skill({ content }))[0]).toMatch(/lines, limit is 100/);
  });

  it('flags a broken references link', () => {
    const content =
      '---\nname: demo-skill\ndescription: Use when testing.\n---\nRead `references/missing.md`.\n';
    const problems = lintSkill(skill({ content, exists: () => false }));
    expect(problems).toEqual(['broken reference: references/missing.md']);
  });

  it('accepts an existing references link', () => {
    const content =
      '---\nname: demo-skill\ndescription: Use when testing.\n---\nRead `references/real.md`.\n';
    expect(lintSkill(skill({ content }))).toEqual([]);
  });
});

describe('lintIndex', () => {
  const table = '| Working on | Skill |\n|---|---|\n| Tests | `testing-vitest` |\n';

  it('accepts a table that lists every skill', () => {
    expect(lintIndex({ skills: ['testing-vitest'], claudeMd: table })).toEqual([]);
  });

  it('flags a skill missing from the table', () => {
    const problems = lintIndex({ skills: ['testing-vitest', 'pr-gate'], claudeMd: table });
    expect(problems).toEqual(['CLAUDE.md skill table is missing: pr-gate']);
  });

  it('flags a table entry without a skill folder', () => {
    const problems = lintIndex({ skills: [], claudeMd: table });
    expect(problems).toEqual(['CLAUDE.md skill table names unknown skill: testing-vitest']);
  });
});
