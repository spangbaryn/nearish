import { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'Customer',
};

// Create mock client
export const mockSupabase = {
  auth: {
    signUp: jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: mockUser,
      error: null,
    }),
  }),
};

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
})); 