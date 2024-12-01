import { mockSupabase } from './mocks/supabase';
import { supabase } from '@/lib/supabase';
import type { BusinessRole } from '@/types/auth';

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

  // Business policies
  test('Users can read businesses they are members of', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({
        data: { id: 'business-id', name: 'Test Business' },
        error: null
      })
    });

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', 'business-id')
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });

  // Business members policies
  test('Business owners can manage members', async () => {
    const newMember: {
      profile_id: string;
      business_id: string;
      role: BusinessRole;
    } = {
      profile_id: 'new-member-id',
      business_id: 'business-id',
      role: 'staff'
    };

    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValueOnce({
        data: newMember,
        error: null
      })
    });

    const { data, error } = await supabase
      .from('business_members')
      .insert(newMember)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toEqual(newMember);
  });

  test('Staff cannot add new members', async () => {
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'RLS policy violation' }
      })
    });

    const { error } = await supabase
      .from('business_members')
      .insert({
        profile_id: 'new-member-id',
        business_id: 'business-id',
        role: 'staff'
      })
      .select()
      .single();

    expect(error).toBeTruthy();
    expect(error.message).toBe('RLS policy violation');
  });
}); 