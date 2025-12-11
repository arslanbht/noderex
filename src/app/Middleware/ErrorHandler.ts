import { Request, Response, NextFunction } from 'express';
import { app as appConfig } from '../../config/app';
import { Logger } from '../Support/Logger';
import { ValidationException } from '../Http/Requests/Request';

/**
 * Custom error classes
 */
export class UnauthorizedError extends Error {
  public status = 401;
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  public status = 403;
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  public status = 404;
  constructor(message: string = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  public status = 409;
  constructor(message: string = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class TooManyRequestsError extends Error {
  public status = 429;
  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'TooManyRequestsError';
  }
}

export class BadRequestError extends Error {
  public status = 400;
  constructor(message: string = 'Bad Request') {
    super(message);
    this.name = 'BadRequestError';
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error with context
  Logger.error('Request Error', error, {
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Default error response
  let status = 500;
  let message = 'Internal Server Error';
  let errors: Record<string, string[]> | undefined;
  let code: string | undefined;

  // Handle specific error types
  if (error instanceof ValidationException) {
    status = 422;
    message = 'Validation failed';
    errors = error.errors;
    code = 'VALIDATION_ERROR';
  } else if (error instanceof UnauthorizedError) {
    status = 401;
    message = error.message || 'Unauthorized';
    code = 'UNAUTHORIZED';
  } else if (error instanceof ForbiddenError) {
    status = 403;
    message = error.message || 'Forbidden';
    code = 'FORBIDDEN';
  } else if (error instanceof NotFoundError) {
    status = 404;
    message = error.message || 'Not found';
    code = 'NOT_FOUND';
  } else if (error instanceof ConflictError) {
    status = 409;
    message = error.message || 'Conflict';
    code = 'CONFLICT';
  } else if (error instanceof TooManyRequestsError) {
    status = 429;
    message = error.message || 'Too many requests';
    code = 'TOO_MANY_REQUESTS';
  } else if (error instanceof BadRequestError) {
    status = 400;
    message = error.message || 'Bad Request';
    code = 'BAD_REQUEST';
  } else if (error.name === 'ValidationException') {
    // Handle ValidationException by name (backward compatibility)
    status = 422;
    message = 'Validation failed';
    errors = error.errors;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError' || error.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Unauthorized';
    code = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
    code = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    status = 404;
    message = 'Not found';
    code = 'NOT_FOUND';
  } else if (error.status) {
    // Handle Express errors with status property
    status = error.status;
    message = error.message || message;
    code = error.code || `HTTP_${status}`;
  } else if (error.code) {
    // Handle errors with code property
    code = error.code;
    message = error.message || message;
  }

  // Build error response
  const errorResponse: any = {
    success: false,
    message,
    code: code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Include errors if available (validation errors)
  if (errors) {
    errorResponse.errors = errors;
  }

  // Include stack trace in development
  if (appConfig.debug && error.stack) {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      name: error.name,
      message: error.message,
    };
  }

  // Don't send response if already sent
  if (!res.headersSent) {
    res.status(status).json(errorResponse);
  }
}
