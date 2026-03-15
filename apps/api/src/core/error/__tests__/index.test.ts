import { describe, it, expect, vi } from 'vitest';
import { AppError, registerErrorHandler } from '../index.js';

// ---------------------------------------------------------------------------
// AppError
// ---------------------------------------------------------------------------

describe('AppError', () => {
  it('sets code correctly', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found', 404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('sets message correctly', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found', 404);
    expect(err.message).toBe('Resource not found');
  });

  it('sets statusCode correctly', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found', 404);
    expect(err.statusCode).toBe(404);
  });

  it('sets name to "AppError"', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found', 404);
    expect(err.name).toBe('AppError');
  });

  it('leaves details undefined when not provided', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found', 404);
    expect(err.details).toBeUndefined();
  });

  it('stores details when provided', () => {
    const details = { field: 'email', issue: 'invalid format' };
    const err = new AppError('VALIDATION_ERROR', 'Invalid input', 400, details);
    expect(err.details).toEqual(details);
  });

  it('is an instance of Error', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found', 404);
    expect(err).toBeInstanceOf(Error);
  });

  it('is an instance of AppError', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found', 404);
    expect(err).toBeInstanceOf(AppError);
  });
});

// ---------------------------------------------------------------------------
// registerErrorHandler
// ---------------------------------------------------------------------------

describe('registerErrorHandler', () => {
  function buildMocks() {
    const mockFastify = {
      setErrorHandler: vi.fn(),
      log: { error: vi.fn() },
    };
    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    const mockRequest = {};
    return { mockFastify, mockReply, mockRequest };
  }

  function getHandler(mockFastify: ReturnType<typeof buildMocks>['mockFastify']) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockFastify.setErrorHandler.mock.calls[0][0] as (
      error: unknown,
      request: unknown,
      reply: unknown
    ) => unknown;
  }

  it('calls fastify.setErrorHandler once', () => {
    const { mockFastify } = buildMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerErrorHandler(mockFastify as any);
    expect(mockFastify.setErrorHandler).toHaveBeenCalledOnce();
  });

  describe('when the error is an AppError', () => {
    it('calls reply.status with error.statusCode', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const error = new AppError('NOT_FOUND', 'Resource not found', 404);
      handler(error, mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
    });

    it('calls reply.send with code and message', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const error = new AppError('NOT_FOUND', 'Resource not found', 404);
      handler(error, mockRequest, mockReply);

      expect(mockReply.send).toHaveBeenCalledWith({
        code: 'NOT_FOUND',
        message: 'Resource not found',
      });
    });

    it('includes details in reply.send body when AppError has details', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const details = { field: 'email', issue: 'invalid format' };
      const error = new AppError('VALIDATION_ERROR', 'Invalid input', 400, details);
      handler(error, mockRequest, mockReply);

      expect(mockReply.send).toHaveBeenCalledWith({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details,
      });
    });

    it('does not call fastify.log.error for AppError', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const error = new AppError('NOT_FOUND', 'Resource not found', 404);
      handler(error, mockRequest, mockReply);

      expect(mockFastify.log.error).not.toHaveBeenCalled();
    });
  });

  describe('when the error is a Fastify validation error (statusCode 400)', () => {
    it('calls reply.status with 400', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const validationError = Object.assign(new Error('body/email must be a string'), {
        statusCode: 400,
      });
      handler(validationError, mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it('calls reply.send with VALIDATION_ERROR code and the original message', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const validationError = Object.assign(new Error('body/email must be a string'), {
        statusCode: 400,
      });
      handler(validationError, mockRequest, mockReply);

      expect(mockReply.send).toHaveBeenCalledWith({
        code: 'VALIDATION_ERROR',
        message: 'body/email must be a string',
      });
    });

    it('does not call fastify.log.error for validation errors', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const validationError = Object.assign(new Error('body/name is required'), {
        statusCode: 400,
      });
      handler(validationError, mockRequest, mockReply);

      expect(mockFastify.log.error).not.toHaveBeenCalled();
    });
  });

  describe('when the error is a generic Error (no statusCode)', () => {
    it('calls reply.status with 500', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const error = new Error('Something went wrong');
      handler(error, mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
    });

    it('calls fastify.log.error with the error', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const error = new Error('Something went wrong');
      handler(error, mockRequest, mockReply);

      expect(mockFastify.log.error).toHaveBeenCalledWith(error);
    });

    it('calls reply.send with INTERNAL_ERROR code and generic message', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const error = new Error('Something went wrong');
      handler(error, mockRequest, mockReply);

      expect(mockReply.send).toHaveBeenCalledWith({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    });

    it('does not expose the original error message in the response', () => {
      const { mockFastify, mockReply, mockRequest } = buildMocks();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerErrorHandler(mockFastify as any);
      const handler = getHandler(mockFastify);

      const error = new Error('Sensitive database connection string leaked');
      handler(error, mockRequest, mockReply);

      const sentBody = (mockReply.send as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
        message: string;
      };
      expect(sentBody.message).not.toContain('Sensitive database connection string leaked');
    });
  });
});
