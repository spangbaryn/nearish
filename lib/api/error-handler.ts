import { AppError } from '@/lib/errors';
import { NextResponse } from 'next/server';


export async function withErrorHandler(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    const appError = AppError.from(error);
    
    console.error('API Error:', {
      name: appError.name,
      message: appError.message,
      code: appError.code,
      status: appError.status
    });

    return NextResponse.json(
      { 
        error: {
          message: appError.message,
          code: appError.code
        }
      },
      { status: appError.status }
    );
  }
} 