import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const toErrorBody = (code: string, message: string, details?: unknown): ErrorBody => ({
  code,
  message,
  ...(details !== undefined ? { details } : {}),
});

export const registerErrorHandler = (fastify: FastifyInstance): void => {
  fastify.setErrorHandler(
    (error: FastifyError | AppError | Error, _request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof AppError) {
        return reply
          .status(error.statusCode)
          .send(toErrorBody(error.code, error.message, error.details));
      }

      // Fastify validation errors
      if ('statusCode' in error && error.statusCode === 400) {
        return reply
          .status(400)
          .send(toErrorBody('VALIDATION_ERROR', error.message));
      }

      fastify.log.error(error);
      return reply
        .status(500)
        .send(toErrorBody('INTERNAL_ERROR', 'Internal server error'));
    }
  );
};
