import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { connectionsRouter } from '../connections';

// Mock the database
const mockDb = {
  select: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  set: jest.fn(),
};

// Mock database schema
jest.mock('@/db/schema', () => ({
  gmailConnection: {
    userId: 'userId',
    id: 'id',
    email: 'email',
    name: 'name',
    picture: 'picture',
    scope: 'scope',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  user: {
    id: 'id',
    gmailConnected: 'gmailConnected',
    updatedAt: 'updatedAt',
  },
}));

// Mock database module
jest.mock('@/db/drizzle', () => ({
  db: mockDb,
}));

describe('Connections Router Accuracy Tests', () => {
  let mockContext: any;
  let mockGmailConnection: any;
  let mockUserRecord: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockContext = {
      db: mockDb,
      session: {
        user: {
          id: 'test-user-id',
        },
      },
      user: {
        id: 'test-user-id',
      },
    };

    mockGmailConnection = {
      id: 'connection-123',
      userId: 'test-user-id',
      email: 'user@gmail.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      scope: 'https://www.googleapis.com/auth/gmail.send',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    mockUserRecord = {
      gmailConnected: true,
    };

    // Setup default mock chains
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit.mockReturnValue(mockDb);
    mockDb.delete.mockReturnValue(mockDb);
    mockDb.update.mockReturnValue(mockDb);
    mockDb.set.mockReturnValue(mockDb);
  });

  describe('checkGmailConnection Accuracy', () => {
    it('should return true when both connection record and flag exist', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockGmailConnection]) // Gmail connection exists
        .mockResolvedValueOnce([mockUserRecord]); // User flag is true

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.checkGmailConnection();

      expect(result.isConnected).toBe(true);
      expect(result.connectionData).toEqual({
        email: 'user@gmail.com',
        name: 'Test User',
        connectedAt: new Date('2024-01-01'),
      });
    });

    it('should return false when connection record exists but flag is false', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockGmailConnection]) // Gmail connection exists
        .mockResolvedValueOnce([{ gmailConnected: false }]); // User flag is false

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.checkGmailConnection();

      expect(result.isConnected).toBe(false);
      expect(result.connectionData).toBeNull();
    });

    it('should return false when flag is true but no connection record', async () => {
      mockDb.limit
        .mockResolvedValueOnce([]) // No Gmail connection
        .mockResolvedValueOnce([mockUserRecord]); // User flag is true

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.checkGmailConnection();

      expect(result.isConnected).toBe(false);
      expect(result.connectionData).toBeNull();
    });

    it('should return false when neither connection record nor flag exist', async () => {
      mockDb.limit
        .mockResolvedValueOnce([]) // No Gmail connection
        .mockResolvedValueOnce([{ gmailConnected: false }]); // User flag is false

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.checkGmailConnection();

      expect(result.isConnected).toBe(false);
      expect(result.connectionData).toBeNull();
    });

    it('should handle missing user record gracefully', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockGmailConnection]) // Gmail connection exists
        .mockResolvedValueOnce([]); // No user record

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.checkGmailConnection();

      expect(result.isConnected).toBe(false);
      expect(result.connectionData).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.checkGmailConnection();

      expect(result.isConnected).toBe(false);
      expect(result.connectionData).toBeNull();
    });

    it('should validate connection data fields accurately', async () => {
      const incompleteConnection = {
        ...mockGmailConnection,
        email: null,
        name: undefined,
      };

      mockDb.limit
        .mockResolvedValueOnce([incompleteConnection])
        .mockResolvedValueOnce([mockUserRecord]);

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.checkGmailConnection();

      expect(result.isConnected).toBe(true);
      expect(result.connectionData).toEqual({
        email: null,
        name: undefined,
        connectedAt: new Date('2024-01-01'),
      });
    });
  });

  describe('getGmailConnectionData Accuracy', () => {
    it('should return complete connection data when available', async () => {
      mockDb.limit.mockResolvedValue([mockGmailConnection]);

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.getGmailConnectionData();

      expect(result).toEqual({
        id: 'connection-123',
        email: 'user@gmail.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
        scope: 'https://www.googleapis.com/auth/gmail.send',
        connectedAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });
    });

    it('should return null when no connection exists', async () => {
      mockDb.limit.mockResolvedValue([]);

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.getGmailConnectionData();

      expect(result).toBeNull();
    });

    it('should handle partial connection data accurately', async () => {
      const partialConnection = {
        id: 'connection-123',
        userId: 'test-user-id',
        email: 'user@gmail.com',
        name: null,
        picture: null,
        scope: 'https://www.googleapis.com/auth/gmail.send',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockDb.limit.mockResolvedValue([partialConnection]);

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.getGmailConnectionData();

      expect(result).toEqual({
        id: 'connection-123',
        email: 'user@gmail.com',
        name: null,
        picture: null,
        scope: 'https://www.googleapis.com/auth/gmail.send',
        connectedAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });
    });

    it('should handle database errors gracefully', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database connection failed'));

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.getGmailConnectionData();

      expect(result).toBeNull();
    });
  });

  describe('refreshConnectionStatus Accuracy', () => {
    it('should detect and fix inconsistent connection state', async () => {
      // Connection exists but flag is false
      mockDb.limit
        .mockResolvedValueOnce([mockGmailConnection]) // Connection exists
        .mockResolvedValueOnce([{ gmailConnected: false }]); // Flag is false

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.refreshConnectionStatus();

      expect(result.isConnected).toBe(true);
      expect(result.wasUpdated).toBe(true);
      expect(result.connectionData).toEqual({
        email: 'user@gmail.com',
        name: 'Test User',
        connectedAt: new Date('2024-01-01'),
      });

      // Should have updated the user record
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        gmailConnected: true,
        updatedAt: expect.any(Date),
      });
    });

    it('should detect inconsistent state when flag is true but no connection', async () => {
      mockDb.limit
        .mockResolvedValueOnce([]) // No connection
        .mockResolvedValueOnce([{ gmailConnected: true }]); // Flag is true

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.refreshConnectionStatus();

      expect(result.isConnected).toBe(false);
      expect(result.wasUpdated).toBe(true);
      expect(result.connectionData).toBeNull();

      // Should have updated the user record
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        gmailConnected: false,
        updatedAt: expect.any(Date),
      });
    });

    it('should not update when state is consistent', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockGmailConnection]) // Connection exists
        .mockResolvedValueOnce([{ gmailConnected: true }]); // Flag is true

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.refreshConnectionStatus();

      expect(result.isConnected).toBe(true);
      expect(result.wasUpdated).toBe(false);
      expect(result.connectionData).toEqual({
        email: 'user@gmail.com',
        name: 'Test User',
        connectedAt: new Date('2024-01-01'),
      });

      // Should not have called update
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should handle database errors during refresh', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.refreshConnectionStatus();

      expect(result.isConnected).toBe(false);
      expect(result.wasUpdated).toBe(false);
      expect(result.connectionData).toBeNull();
    });

    it('should handle update failure gracefully', async () => {
      mockDb.limit
        .mockResolvedValueOnce([mockGmailConnection])
        .mockResolvedValueOnce([{ gmailConnected: false }]);
      
      mockDb.set.mockRejectedValue(new Error('Update failed'));

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.refreshConnectionStatus();

      expect(result.isConnected).toBe(false);
      expect(result.wasUpdated).toBe(false);
      expect(result.connectionData).toBeNull();
    });
  });

  describe('disconnectGmail Accuracy', () => {
    it('should successfully disconnect Gmail connection', async () => {
      mockDb.where.mockResolvedValue(undefined); // Delete successful
      mockDb.set.mockResolvedValue(undefined); // Update successful

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.disconnectGmail();

      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        gmailConnected: false,
        updatedAt: expect.any(Date),
      });
    });

    it('should handle delete operation failure', async () => {
      mockDb.where.mockRejectedValue(new Error('Delete failed'));

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.disconnectGmail();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to disconnect Gmail');
    });

    it('should handle user update failure', async () => {
      mockDb.where.mockResolvedValueOnce(undefined); // Delete succeeds
      mockDb.set.mockRejectedValue(new Error('Update failed')); // Update fails

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.disconnectGmail();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to disconnect Gmail');
    });

    it('should handle disconnecting when no connection exists', async () => {
      // Even if no connection exists, operation should succeed
      mockDb.where.mockResolvedValue(undefined);
      mockDb.set.mockResolvedValue(undefined);

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.disconnectGmail();

      expect(result.success).toBe(true);
    });
  });

  describe('Connection State Consistency Tests', () => {
    it('should maintain consistency across multiple simultaneous checks', async () => {
      mockDb.limit
        .mockResolvedValue([mockGmailConnection])
        .mockResolvedValue([mockUserRecord]);

      const caller = connectionsRouter.createCaller(mockContext);
      
      // Simulate multiple simultaneous connection checks
      const promises = Array(10).fill(null).map(() => 
        caller.checkGmailConnection()
      );

      const results = await Promise.all(promises);

      // All results should be consistent
      results.forEach(result => {
        expect(result.isConnected).toBe(true);
        expect(result.connectionData?.email).toBe('user@gmail.com');
      });
    });

    it('should handle race conditions in refresh operations', async () => {
      // Simulate inconsistent state
      mockDb.limit
        .mockResolvedValue([mockGmailConnection])
        .mockResolvedValue([{ gmailConnected: false }]);

      const caller = connectionsRouter.createCaller(mockContext);

      // Multiple simultaneous refresh operations
      const promises = Array(5).fill(null).map(() => 
        caller.refreshConnectionStatus()
      );

      const results = await Promise.allSettled(promises);

      // At least one should succeed and fix the inconsistency
      const successful = results.filter(r => 
        r.status === 'fulfilled' && r.value.isConnected
      );

      expect(successful.length).toBeGreaterThan(0);
    });

    it('should accurately report connection timestamps', async () => {
      const specificDate = new Date('2024-06-15T10:30:00Z');
      const connectionWithSpecificDate = {
        ...mockGmailConnection,
        createdAt: specificDate,
        updatedAt: new Date('2024-06-16T14:45:00Z'),
      };

      mockDb.limit.mockResolvedValue([connectionWithSpecificDate]);

      const caller = connectionsRouter.createCaller(mockContext);
      const result = await caller.getGmailConnectionData();

      expect(result?.connectedAt).toEqual(specificDate);
      expect(result?.updatedAt).toEqual(new Date('2024-06-16T14:45:00Z'));
    });

    it('should handle edge cases in connection data', async () => {
      const edgeCaseConnection = {
        id: '',
        userId: 'test-user-id',
        email: '',
        name: '',
        picture: '',
        scope: '',
        createdAt: new Date(0), // Unix epoch
        updatedAt: new Date('2099-12-31'), // Far future
      };

      mockDb.limit
        .mockResolvedValueOnce([edgeCaseConnection])
        .mockResolvedValueOnce([{ gmailConnected: true }]);

      const caller = connectionsRouter.createCaller(mockContext);
      const checkResult = await caller.checkGmailConnection();

      expect(checkResult.isConnected).toBe(true);
      expect(checkResult.connectionData).toEqual({
        email: '',
        name: '',
        connectedAt: new Date(0),
      });
    });

    it('should validate connection scope accuracy', async () => {
      const differentScopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'invalid-scope',
        '',
      ];

      for (const scope of differentScopes) {
        const connectionWithScope = {
          ...mockGmailConnection,
          scope,
        };

        mockDb.limit.mockResolvedValue([connectionWithScope]);

        const caller = connectionsRouter.createCaller(mockContext);
        const result = await caller.getGmailConnectionData();

        expect(result?.scope).toBe(scope);
      }
    });
  });

  describe('Performance and Reliability Under Load', () => {
    it('should maintain accuracy under high frequency checks', async () => {
      mockDb.limit
        .mockResolvedValue([mockGmailConnection])
        .mockResolvedValue([mockUserRecord]);

      const caller = connectionsRouter.createCaller(mockContext);
      const startTime = Date.now();

      // Perform 100 connection checks rapidly
      const promises = Array(100).fill(null).map(() => 
        caller.checkGmailConnection()
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All results should be accurate and consistent
      results.forEach(result => {
        expect(result.isConnected).toBe(true);
        expect(result.connectionData?.email).toBe('user@gmail.com');
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds

      console.log(`Connection check performance: ${results.length} checks in ${endTime - startTime}ms`);
    });

    it('should handle connection state changes accurately', async () => {
      const caller = connectionsRouter.createCaller(mockContext);

      // Initially connected
      mockDb.limit
        .mockResolvedValueOnce([mockGmailConnection])
        .mockResolvedValueOnce([mockUserRecord]);

      let result = await caller.checkGmailConnection();
      expect(result.isConnected).toBe(true);

      // Then disconnected
      mockDb.limit
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ gmailConnected: false }]);

      result = await caller.checkGmailConnection();
      expect(result.isConnected).toBe(false);

      // Then reconnected
      mockDb.limit
        .mockResolvedValueOnce([mockGmailConnection])
        .mockResolvedValueOnce([mockUserRecord]);

      result = await caller.checkGmailConnection();
      expect(result.isConnected).toBe(true);
    });
  });
});