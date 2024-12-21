import { AppError } from './base';

export class APIError extends AppError {
  constructor(
    message = 'API request failed',
    code = 'API_ERROR',
    status = 500,
    data?: unknown
  ) {
    super(message, code, status, data);
    this.name = 'APIError';
  }

  static notFound(resource: string): APIError {
    return new APIError(
      `${resource} not found`,
      'API_NOT_FOUND',
      404,
      { resource }
    );
  }

  static serverError(details?: unknown): APIError {
    return new APIError(
      'Internal server error',
      'API_SERVER_ERROR',
      500,
      details
    );
  }
} 