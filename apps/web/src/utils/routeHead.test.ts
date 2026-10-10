import { describe, it, expect } from 'vitest';
import { buildHead, SITE_NAME } from './routeHead';

describe('buildHead', () => {
  it('should set the document title', () => {
    const { meta } = buildHead('Title', 'Description');
    expect(meta).toContainEqual({ title: 'Title' });
  });

  it('should set the description meta tag', () => {
    const { meta } = buildHead('Title', 'Description');
    expect(meta).toContainEqual({ name: 'description', content: 'Description' });
  });

  it('should set Open Graph tags used by share previews', () => {
    const { meta } = buildHead('Title', 'Description');
    expect(meta).toContainEqual({ property: 'og:title', content: 'Title' });
    expect(meta).toContainEqual({ property: 'og:description', content: 'Description' });
    expect(meta).toContainEqual({ property: 'og:type', content: 'website' });
    expect(meta).toContainEqual({ property: 'og:site_name', content: SITE_NAME });
  });
});
