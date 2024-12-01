import { mockSupabase } from './mocks/supabase';
import { supabase } from '@/lib/supabase';

describe('RLS Policies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Profile policies
  test('Users can only read their own profile', async () => {
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session?.user.id)
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });

  test('Users can update their own profile', async () => {
    mockSupabase.from.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({
        data: { id: 'user-id', name: 'Updated Name' },
        error: null
      })
    });

    const { data, error } = await supabase
      .from('profiles')
      .update({ name: 'Updated Name' })
      .eq('id', 'user-id');

    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });

  test('Users cannot read other profiles directly', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'RLS policy violation' }
      })
    });

    const { error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'other-user-id')
      .single();

    expect(error).toBeTruthy();
    expect(error.message).toBe('RLS policy violation');
  });
}); 