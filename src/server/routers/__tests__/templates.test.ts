import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { templatesRouter } from '../templates';
import { TRPCError } from '@trpc/server';

// Mock the database
const mockDb = {
  select: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  orderBy: jest.fn(),
  values: jest.fn(),
  set: jest.fn(),
  returning: jest.fn(),
};

// Mock database module
jest.mock('@/db/drizzle', () => ({
  db: mockDb,
}));

// Mock database schema
jest.mock('@/db/schema', () => ({
  emailTemplates: {
    userId: 'userId',
    id: 'id',
    name: 'name',
    tone: 'tone',
    isDefault: 'isDefault',
    isActive: 'isActive',
  },
}));

describe('Templates Router', () => {
  let mockContext: any;

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

    // Setup default mock chains
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.orderBy.mockReturnValue(mockDb);
    mockDb.insert.mockReturnValue(mockDb);
    mockDb.update.mockReturnValue(mockDb);
    mockDb.delete.mockReturnValue(mockDb);
    mockDb.values.mockReturnValue(mockDb);
    mockDb.set.mockReturnValue(mockDb);
    mockDb.returning.mockResolvedValue([]);
  });

  describe('getAll', () => {
    it('should return all templates for authenticated user', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Polite Reminder',
          subject: 'Payment Reminder',
          content: 'Please pay your invoice',
          tone: 'polite',
          category: 'reminder',
          isDefault: true,
          isActive: true,
          userId: 'test-user-id',
        },
        {
          id: '2',
          name: 'Urgent Reminder',
          subject: 'URGENT: Payment Required',
          content: 'Immediate payment required',
          tone: 'urgent',
          category: 'reminder',
          isDefault: false,
          isActive: true,
          userId: 'test-user-id',
        },
      ];

      mockDb.orderBy.mockResolvedValue(mockTemplates);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.getAll();

      expect(result).toEqual(mockTemplates);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('Database error'));

      const caller = templatesRouter.createCaller(mockContext);
      
      await expect(caller.getAll()).rejects.toThrow('Failed to get templates');
    });
  });

  describe('getById', () => {
    it('should return template by ID for authenticated user', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'Test content',
        tone: 'polite',
        category: 'reminder',
        userId: 'test-user-id',
      };

      mockDb.where.mockResolvedValue([mockTemplate]);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.getById({ id: '1' });

      expect(result).toEqual(mockTemplate);
    });

    it('should throw error when template not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const caller = templatesRouter.createCaller(mockContext);
      
      await expect(caller.getById({ id: 'non-existent' })).rejects.toThrow('Failed to get template');
    });
  });

  describe('getByTone', () => {
    it('should return templates filtered by tone', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Polite Template 1',
          tone: 'polite',
          userId: 'test-user-id',
        },
        {
          id: '2',
          name: 'Polite Template 2',
          tone: 'polite',
          userId: 'test-user-id',
        },
      ];

      mockDb.orderBy.mockResolvedValue(mockTemplates);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.getByTone({ tone: 'polite' });

      expect(result).toEqual(mockTemplates);
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new template successfully', async () => {
      const newTemplateData = {
        name: 'New Template',
        subject: 'New Subject',
        content: 'New content',
        tone: 'polite' as const,
        category: 'reminder' as const,
        isDefault: false,
        isActive: true,
      };

      const createdTemplate = {
        id: 'new-id',
        ...newTemplateData,
        userId: 'test-user-id',
      };

      mockDb.returning.mockResolvedValue([createdTemplate]);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.create(newTemplateData);

      expect(result).toEqual(createdTemplate);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should unset other defaults when creating default template', async () => {
      const newTemplateData = {
        name: 'New Default Template',
        subject: 'Default Subject',
        content: 'Default content',
        tone: 'polite' as const,
        category: 'reminder' as const,
        isDefault: true,
        isActive: true,
      };

      const createdTemplate = {
        id: 'new-id',
        ...newTemplateData,
        userId: 'test-user-id',
      };

      mockDb.returning.mockResolvedValue([createdTemplate]);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.create(newTemplateData);

      expect(result).toEqual(createdTemplate);
      // Should have called update to unset other defaults
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const newTemplateData = {
        name: 'New Template',
        subject: 'New Subject',
        content: 'New content',
        tone: 'polite' as const,
        category: 'reminder' as const,
        isDefault: false,
        isActive: true,
      };

      mockDb.returning.mockRejectedValue(new Error('Database error'));

      const caller = templatesRouter.createCaller(mockContext);
      
      await expect(caller.create(newTemplateData)).rejects.toThrow('Failed to create template');
    });
  });

  describe('update', () => {
    it('should update existing template successfully', async () => {
      const existingTemplate = {
        id: '1',
        name: 'Existing Template',
        userId: 'test-user-id',
      };

      const updateData = {
        name: 'Updated Template',
        isDefault: false,
        tone: 'firm' as const,
      };

      const updatedTemplate = {
        ...existingTemplate,
        ...updateData,
        updatedAt: new Date(),
      };

      mockDb.where.mockResolvedValueOnce([existingTemplate]);
      mockDb.returning.mockResolvedValue([updatedTemplate]);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.update({ id: '1', data: updateData });

      expect(result).toEqual(updatedTemplate);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should throw error when template not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const caller = templatesRouter.createCaller(mockContext);
      
      await expect(caller.update({ 
        id: 'non-existent', 
        data: { name: 'Updated' } 
      })).rejects.toThrow('Failed to update template');
    });
  });

  describe('delete', () => {
    it('should delete template successfully', async () => {
      const existingTemplate = {
        id: '1',
        name: 'Template to Delete',
        userId: 'test-user-id',
      };

      mockDb.where.mockResolvedValueOnce([existingTemplate]);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.delete({ id: '1' });

      expect(result).toEqual({ success: true });
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw error when template not found for deletion', async () => {
      mockDb.where.mockResolvedValue([]);

      const caller = templatesRouter.createCaller(mockContext);
      
      await expect(caller.delete({ id: 'non-existent' })).rejects.toThrow('Failed to delete template');
    });
  });

  describe('toggleActive', () => {
    it('should toggle template active status successfully', async () => {
      const updatedTemplate = {
        id: '1',
        name: 'Test Template',
        isActive: false,
        updatedAt: new Date(),
      };

      mockDb.returning.mockResolvedValue([updatedTemplate]);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.toggleActive({ id: '1', isActive: false });

      expect(result).toEqual(updatedTemplate);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        isActive: false,
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when template not found for toggle', async () => {
      mockDb.returning.mockResolvedValue([]);

      const caller = templatesRouter.createCaller(mockContext);
      
      await expect(caller.toggleActive({ 
        id: 'non-existent', 
        isActive: true 
      })).rejects.toThrow('Failed to update template status');
    });
  });

  describe('getWithStats', () => {
    it('should return templates with usage statistics', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Template 1',
          category: 'reminder',
          tone: 'polite',
          isActive: true,
          isDefault: true,
          usageCount: 5,
        },
        {
          id: '2',
          name: 'Template 2',
          category: 'followup',
          tone: 'firm',
          isActive: true,
          isDefault: false,
          usageCount: 3,
        },
      ];

      mockDb.orderBy.mockResolvedValue(mockTemplates);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.getWithStats();

      expect(result.templates).toEqual(mockTemplates);
      expect(result.stats).toEqual({
        totalTemplates: 2,
        activeTemplates: 2,
        defaultTemplates: 1,
        byCategory: {
          reminder: 1,
          followup: 1,
        },
        byTone: {
          polite: 1,
          firm: 1,
        },
      });
    });

    it('should handle empty templates list', async () => {
      mockDb.orderBy.mockResolvedValue([]);

      const caller = templatesRouter.createCaller(mockContext);
      const result = await caller.getWithStats();

      expect(result.templates).toEqual([]);
      expect(result.stats).toEqual({
        totalTemplates: 0,
        activeTemplates: 0,
        defaultTemplates: 0,
        byCategory: {},
        byTone: {},
      });
    });
  });
});