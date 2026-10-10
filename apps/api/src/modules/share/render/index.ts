const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]!);

export const truncate = (value: string, max: number): string =>
  value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;

export interface SharePreview {
  title: string;
  description: string;
  redirectUrl: string;
}

export const renderSharePreview = ({ title, description, redirectUrl }: SharePreview): string => {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(redirectUrl);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${t}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${d}">
<meta property="og:site_name" content="FutMeet">
<meta property="og:type" content="website">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<link rel="canonical" href="${u}">
<meta http-equiv="refresh" content="0;url=${u}">
</head>
<body>
<p><a href="${u}">Open ${t} in FutMeet</a></p>
</body>
</html>
`;
};
