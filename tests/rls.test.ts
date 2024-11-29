import { mockSupabase } from './mocks/supabase';
import { supabase } from '@/lib/supabase';

describe('RLS Policies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Users can only read their own data', async () => {
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    const { data: ownData, error: ownError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session?.user.id)
      .single();

    expect(ownError).toBeNull();
    expect(ownData).toBeTruthy();
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
  });

  test('Users cannot update other users data', async () => {
    mockSupabase.from.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'RLS policy violation' }
      })
    });

    const { error } = await supabase
      .from('users')
      .update({ role: 'Admin' })
      .eq('id', 'other-user-id')
      .single();

    if (!error) throw new Error('Expected error but got null');
    expect(error.message).toBe('RLS policy violation');
  });

  test('Admin can read all users data', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({
        data: { id: 'other-user-id', role: 'Customer' },
        error: null
      })
    });

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });
}); 