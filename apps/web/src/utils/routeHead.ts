export const SITE_NAME = 'FutMeet';

export const buildHead = (title: string, description: string) => ({
  meta: [
    { title },
    { name: 'description', content: description },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ],
});
