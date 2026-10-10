import { describe, it, expect } from 'vitest';
import { escapeHtml, truncate, renderSharePreview } from '@modules/share/render/index.js';

describe('escapeHtml', () => {
  it('escapes all HTML special characters', () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    );
  });

  it('leaves plain text unchanged', () => {
    expect(escapeHtml('Alice')).toBe('Alice');
  });
});

describe('truncate', () => {
  it('returns short strings unchanged', () => {
    expect(truncate('abc', 5)).toBe('abc');
  });

  it('truncates long strings with an ellipsis within the max length', () => {
    const out = truncate('abcdefghij', 5);
    expect(out).toBe('abcd…');
    expect(out.length).toBe(5);
  });
});

describe('renderSharePreview', () => {
  const html = renderSharePreview({
    title: 'My title',
    description: 'My description',
    redirectUrl: 'https://app.example.com/waiting-room/abc',
  });

  it('includes Open Graph and Twitter tags', () => {
    expect(html).toContain('<meta property="og:title" content="My title">');
    expect(html).toContain('<meta property="og:description" content="My description">');
    expect(html).toContain('<meta name="twitter:card" content="summary">');
    expect(html).toContain('<meta name="twitter:title" content="My title">');
  });

  it('includes a meta refresh redirect and a visible link', () => {
    expect(html).toContain(
      '<meta http-equiv="refresh" content="0;url=https://app.example.com/waiting-room/abc">'
    );
    expect(html).toContain('<a href="https://app.example.com/waiting-room/abc">');
  });

  it('escapes injected markup in every field', () => {
    const out = renderSharePreview({
      title: '"><script>alert(1)</script>',
      description: '"><img src=x onerror=alert(1)>',
      redirectUrl: 'https://a.example/"><script>x</script>',
    });
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
