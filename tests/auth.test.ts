import { mockSupabase } from './mocks/supabase';
import { supabase } from '@/lib/supabase';

describe('Auth Flow', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    role: 'Customer' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Sign up creates user with correct role', async () => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: { role: testUser.role }
      }
    });

    expect(signUpError).toBeNull();
    expect(signUpData.user).toBeTruthy();
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: { role: testUser.role }
      }
    });
  });

  test('Sign up fails with invalid email', async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid email format')
    });

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'invalid-email',
      password: testUser.password,
      options: {
        data: { role: testUser.role }
      }
    });

    expect(signUpError).toBeTruthy();
    expect(signUpData.user).toBeNull();
  });

  test('Sign up fails with weak password', async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Password too weak')
    });

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: '123',
      options: {
        data: { role: testUser.role }
      }
    });

    expect(signUpError).toBeTruthy();
    expect(signUpData.user).toBeNull();
  });
}); 