import { AppError } from './base';

export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed',
    code = 'VALIDATION_ERROR',
    status = 400,
    data?: unknown
  ) {
    super(message, code, status, data);
    this.name = 'ValidationError';
  }

  static invalidInput(field: string): ValidationError {
    return new ValidationError(
      `Invalid ${field} provided`,
      'VALIDATION_INVALID_INPUT',
      400,
      { field }
    );
  }

  static required(field: string): ValidationError {
    return new ValidationError(
      `${field} is required`,
      'VALIDATION_REQUIRED_FIELD',
      400,
      { field }
    );
  }
} 