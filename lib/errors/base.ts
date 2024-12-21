export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public status: number = 500,
    public data?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static from(error: unknown, defaultMessage = 'An unexpected error occurred'): AppError {
    if (error instanceof AppError) return error;
    
    if (error instanceof Error) {
      return new AppError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        { originalError: error.name }
      );
    }

    if (typeof error === 'string') {
      return new AppError(error);
    }

    return new AppError(defaultMessage);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      data: this.data,
    };
  }
}