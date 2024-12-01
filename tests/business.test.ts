import { mockSupabase } from './mocks/supabase';
import { addBusinessMember, getUserBusinesses } from '@/lib/business';

describe('Business Helper Functions', () => {
  const testUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addBusinessMember', () => {
    test('adds new member to business', async () => {
      const memberData = {
        profile_id: 'member-id',
        business_id: 'business-id',
        role: 'staff' as const
      };

      mockSupabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: memberData,
          error: null
        })
      }));

      const result = await addBusinessMember(
        memberData.business_id,
        memberData.profile_id,
        memberData.role
      );
      expect(result).toEqual(memberData);
    });
  });

  describe('getUserBusinesses', () => {
    test('gets all businesses for user', async () => {
      const businessesData = [{
        role: 'owner',
        business: {
          id: 'business-id',
          name: 'Test Business',
          description: 'Test Description'
        }
      }];

      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          data: businessesData,
          error: null
        })
      }));

      const result = await getUserBusinesses(testUserId);
      expect(result).toEqual(businessesData);
    });

    test('handles database query error', async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Database query failed' }
        })
      }));

      await expect(getUserBusinesses(testUserId))
        .rejects
        .toEqual({ message: 'Database query failed' });
    });

    test('handles empty results', async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValueOnce({
          data: [],
          error: null
        })
      }));

      const result = await getUserBusinesses(testUserId);
      expect(result).toEqual([]);
    });
  });
});

describe('Business Helper Functions Error Handling', () => {
  const testUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addBusinessMember', () => {
    test('handles unauthorized member addition', async () => {
      mockSupabase.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Not authorized to add members' }
        })
      }));

      await expect(addBusinessMember('business-id', 'user-id', 'staff'))
        .rejects
        .toEqual({ message: 'Not authorized to add members' });
    });
  });
}); 