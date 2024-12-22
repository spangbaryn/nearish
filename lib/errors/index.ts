// Re-export all error types
export * from './base';
export * from './auth';
export * from './validation';
export * from './api';
export * from './database';
export * from './handlers';

// Central error handling utility
export { handleError, handleErrorWithToast } from './handlers';