import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareController } from '@modules/share/controller/index.js';

const mockService = { getRoomPreviewHtml: vi.fn(), getResultsPreviewHtml: vi.fn() };
const controller = new ShareController(mockService as any);

const buildReply = () => {
  const reply: any = {};
  reply.header = vi.fn().mockReturnValue(reply);
  reply.type = vi.fn().mockReturnValue(reply);
  reply.send = vi.fn().mockReturnValue(reply);
  return reply;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ShareController.getRoomPreview', () => {
  it('calls the service and sends cacheable HTML', async () => {
    mockService.getRoomPreviewHtml.mockResolvedValue('<html>room</html>');
    const reply = buildReply();
    await controller.getRoomPreview({ params: { roomId: 'r1' } } as any, reply);
    expect(mockService.getRoomPreviewHtml).toHaveBeenCalledWith('r1');
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60');
    expect(reply.type).toHaveBeenCalledWith('text/html; charset=utf-8');
    expect(reply.send).toHaveBeenCalledWith('<html>room</html>');
  });

  it('propagates service errors', async () => {
    mockService.getRoomPreviewHtml.mockRejectedValue(new Error('nope'));
    await expect(
      controller.getRoomPreview({ params: { roomId: 'r1' } } as any, buildReply())
    ).rejects.toThrow('nope');
  });
});

describe('ShareController.getResultsPreview', () => {
  it('calls the service and sends cacheable HTML', async () => {
    mockService.getResultsPreviewHtml.mockResolvedValue('<html>results</html>');
    const reply = buildReply();
    await controller.getResultsPreview({ params: { gameId: 'g1' } } as any, reply);
    expect(mockService.getResultsPreviewHtml).toHaveBeenCalledWith('g1');
    expect(reply.type).toHaveBeenCalledWith('text/html; charset=utf-8');
    expect(reply.send).toHaveBeenCalledWith('<html>results</html>');
  });
});
