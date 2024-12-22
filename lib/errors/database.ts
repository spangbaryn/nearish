import { AppError } from './base';

export class DatabaseError extends AppError {
  constructor(
    message = 'Database operation failed',
    code = 'DATABASE_ERROR',
    status = 500,
    data?: unknown
  ) {
    super(message, code, status, data);
    this.name = 'DatabaseError';
  }
} 