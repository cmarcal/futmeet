import { describe, it, expect } from 'vitest';
import { addPlayerSchema } from './playerSchemas';

describe('addPlayerSchema', () => {
  it('accepts valid name', () => {
    const result = addPlayerSchema.safeParse({ name: 'João' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('João');
  });

  it('trims whitespace', () => {
    const result = addPlayerSchema.safeParse({ name: '  Maria  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Maria');
  });

  it('rejects empty name', () => {
    const result = addPlayerSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 50 characters', () => {
    const result = addPlayerSchema.safeParse({ name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('rejects name containing < (XSS defense-in-depth)', () => {
    const result = addPlayerSchema.safeParse({ name: 'Bad<script>alert(1)</script>' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('não pode conter'))).toBe(true);
    }
  });

  it('rejects name containing > (XSS defense-in-depth)', () => {
    const result = addPlayerSchema.safeParse({ name: 'Bad>tag' });
    expect(result.success).toBe(false);
  });
});
