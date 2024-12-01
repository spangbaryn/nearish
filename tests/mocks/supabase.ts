import { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'Customer',
};

const mockBusiness = {
  id: 'business-id',
  name: 'Test Business',
  description: 'Test Description',
};

// Create mock client
export const mockSupabase = {
  auth: {
    signUp: jest.fn().mockResolvedValue({
      data: { 
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { 
        session: { 
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        }
      },
      error: null,
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { 
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      },
      error: null,
    }),
  },
  from: jest.fn().mockImplementation((table) => {
    const baseQuery = {
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
    };

    const errorHandling = (mockData: any) => ({
      ...baseQuery,
      single: jest.fn().mockImplementation(() => {
        if (mockData.error) {
          return Promise.resolve({
            data: null,
            error: mockData.error
          });
        }
        return Promise.resolve({
          data: mockData.data,
          error: null
        });
      })
    });

    switch (table) {
      case 'businesses':
        return errorHandling({
          data: mockBusiness,
          error: null
        });
      case 'business_members':
        return errorHandling({
          data: {
            profile_id: mockUser.id,
            business_id: mockBusiness.id,
            role: 'owner'
          },
          error: null
        });
      default:
        return errorHandling({
          data: mockUser,
          error: null
        });
    }
  })
};

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
})); 