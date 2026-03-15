const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databaseUrl: requireEnv('DATABASE_URL'),
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
} as const;
