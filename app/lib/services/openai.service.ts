import OpenAI from 'openai';
import { AppError } from '@/lib/errors';

if (!process.env.OPENAI_API_KEY) {
  throw new AppError('ConfigError', 'Missing OpenAI API key');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}); 