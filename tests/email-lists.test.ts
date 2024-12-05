import { mockSupabase } from './mocks/supabase';
import { supabase } from '@/lib/supabase';
import { 
  getUserLists, 
  subscribeToList, 
  unsubscribeFromList, 
  getAllLists 
} from '@/lib/email-lists';

describe('Email List Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserLists returns subscribed lists', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockResolvedValueOnce({
        data: [
          {
            list_id: '1',
            email_lists: { id: '1', name: 'Weekly Roundup', description: 'Weekly updates' }
          }
        ],
        error: null
      })
    });

    const lists = await getUserLists('user-id');
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe('Weekly Roundup');
  });

  test('subscribeToList handles subscription', async () => {
    mockSupabase.from.mockReturnValueOnce({
      upsert: jest.fn().mockResolvedValueOnce({
        error: null
      })
    });

    await expect(subscribeToList('user-id', 'list-id')).resolves.not.toThrow();
  });

  test('unsubscribeFromList handles unsubscription', async () => {
    mockSupabase.from.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({
        error: null
      })
    });

    await expect(unsubscribeFromList('user-id', 'list-id')).resolves.not.toThrow();
  });
}); 