import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerSecurity } from '../index.js';

vi.mock('@/config.js', () => ({
  config: {
    nodeEnv: 'development',
    corsOrigins: ['http://localhost:5173'],
    apiKey: 'test-api-key',
  },
}));

vi.mock('@fastify/cors', () => ({ default: vi.fn() }));
vi.mock('@fastify/helmet', () => ({ default: vi.fn() }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMocks() {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };

  const mockFastify = {
    register: vi.fn().mockResolvedValue(undefined),
    addHook: vi.fn(),
    log: { error: vi.fn() },
  };

  return { mockFastify, mockReply };
}

async function getOnRequestHandler(
  mockFastify: ReturnType<typeof buildMocks>['mockFastify'],
) {
  await registerSecurity(mockFastify as never);
  const [, handler] = mockFastify.addHook.mock.calls.find(
    ([name]) => name === 'onRequest',
  ) as [string, (req: unknown, reply: unknown) => Promise<void>];
  return handler;
}

// ---------------------------------------------------------------------------
// registerSecurity — plugin registration
// ---------------------------------------------------------------------------

describe('registerSecurity', () => {
  it('registers helmet', async () => {
    const { mockFastify } = buildMocks();
    await registerSecurity(mockFastify as never);
    expect(mockFastify.register).toHaveBeenCalled();
  });

  it('registers cors', async () => {
    const { mockFastify } = buildMocks();
    await registerSecurity(mockFastify as never);
    expect(mockFastify.register).toHaveBeenCalledTimes(2);
  });

  it('adds an onRequest hook', async () => {
    const { mockFastify } = buildMocks();
    await registerSecurity(mockFastify as never);
    expect(mockFastify.addHook).toHaveBeenCalledWith('onRequest', expect.any(Function));
  });
});

// ---------------------------------------------------------------------------
// onRequest hook — /health bypass
// ---------------------------------------------------------------------------

describe('onRequest hook — /health bypass', () => {
  it('does not check API key for GET /health', async () => {
    const { mockFastify, mockReply } = buildMocks();
    const handler = await getOnRequestHandler(mockFastify);

    await handler({ url: '/health' }, mockReply);

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('does not check API key for /health/ (trailing slash)', async () => {
    const { mockFastify, mockReply } = buildMocks();
    const handler = await getOnRequestHandler(mockFastify);

    await handler({ url: '/health/' }, mockReply);

    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('does not check API key for /health?probe=1 (query string)', async () => {
    const { mockFastify, mockReply } = buildMocks();
    const handler = await getOnRequestHandler(mockFastify);

    await handler({ url: '/health?probe=1' }, mockReply);

    expect(mockReply.status).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// onRequest hook — API key validation
// ---------------------------------------------------------------------------

describe('onRequest hook — API key validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when x-api-key header is missing', async () => {
    const { mockFastify, mockReply } = buildMocks();
    const handler = await getOnRequestHandler(mockFastify);

    await handler({ url: '/api/v1/rooms', headers: {} }, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: 'UNAUTHORIZED',
      message: 'Invalid or missing API key',
    });
  });

  it('returns 401 when x-api-key is wrong', async () => {
    const { mockFastify, mockReply } = buildMocks();
    const handler = await getOnRequestHandler(mockFastify);

    await handler({ url: '/api/v1/rooms', headers: { 'x-api-key': 'wrong-key' } }, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
  });

  it('passes through when x-api-key is correct', async () => {
    const { mockFastify, mockReply } = buildMocks();
    const handler = await getOnRequestHandler(mockFastify);

    await handler({ url: '/api/v1/rooms', headers: { 'x-api-key': 'test-api-key' } }, mockReply);

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
