import { mockSupabase } from './mocks/supabase';
import { signUp, getUserProfile } from '@/lib/auth';
import type { User, UserRole } from '@/types/auth';

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('Auth Functions', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    test('creates user and profile with customer role', async () => {
      // Mock auth signup
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-id',
            email: testUser.email
          }
        },
        error: null
      });

      // Mock profile creation
      mockSupabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: {
            id: 'test-id',
            email: testUser.email,
            role: 'customer'
          },
          error: null
        })
      }));

      const user = await signUp(testUser.email, testUser.password);
      
      expect(user).toEqual({
        id: 'test-id',
        email: testUser.email,
        role: 'customer'
      });

      // Verify no role in metadata
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: testUser.email,
        password: testUser.password,
        options: {
          emailRedirectTo: expect.any(String)
        }
      });
    });

    test('handles auth error', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Invalid email')
      });

      await expect(signUp(testUser.email, testUser.password))
        .rejects
        .toThrow('Invalid email');
    });

    test('handles profile creation error', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-id',
            email: testUser.email
          }
        },
        error: null
      });

      mockSupabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: new Error('Profile creation failed')
        })
      }));

      await expect(signUp(testUser.email, testUser.password))
        .rejects
        .toThrow('Profile creation failed');
    });
  });

  describe('getUserProfile', () => {
    test('retrieves user profile with role', async () => {
      const profileData = {
        id: 'test-id',
        email: testUser.email,
        role: 'customer' as UserRole
      };

      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: profileData,
          error: null
        })
      }));

      const profile = await getUserProfile('test-id');
      expect(profile).toEqual(profileData);
    });

    test('handles profile not found', async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: null
        })
      }));

      await expect(getUserProfile('test-id'))
        .rejects
        .toThrow('Profile not found');
    });
  });
}); 