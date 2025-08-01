import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { createTRPCContext } from "../../trpc";
import { dashboardRouter } from "../dashboard";
import { TRPCError } from "@trpc/server";

// Mock the database
const mockDb = {
  select: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  offset: jest.fn(),
};

// Mock the auth
const mockAuth = {
  api: {
    getSession: jest.fn(),
  },
};

// Mock headers
jest.mock("next/headers", () => ({
  headers: jest.fn().mockResolvedValue(new Headers()),
}));

// Mock database and auth modules
jest.mock("@/db/drizzle", () => ({
  db: mockDb,
}));

jest.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

describe("Dashboard Router", () => {
  let mockContext: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContext = {
      db: mockDb,
      session: {
        user: {
          id: "test-user-id",
        },
      },
      user: {
        id: "test-user-id",
      },
    };

    // Setup default mock chains
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockResolvedValue([]);
  });

  describe("getStats", () => {
    it("should return default stats when no invoices exist", async () => {
      mockDb.where.mockResolvedValue([]);

      const caller = dashboardRouter.createCaller(mockContext);
      const result = await caller.getStats();

      expect(result).toEqual({
        pendingInvoices: 0,
        overdueInvoices: 0,
        paidInvoices: 0,
        outstandingAmount: "$0.00",
        recentInvoices: [],
      });
    });

    it("should calculate correct stats with sample invoices", async () => {
      const mockInvoices = [
        {
          id: "1",
          status: "pending",
          amount: "100.00",
          dueDate: new Date("2024-01-01"), // past due
          createdAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          status: "paid",
          amount: "200.00",
          dueDate: new Date("2024-02-01"),
          createdAt: new Date("2024-01-16"),
        },
        {
          id: "3",
          status: "pending",
          amount: "300.00",
          dueDate: new Date("2024-12-01"), // future
          createdAt: new Date("2024-01-17"),
        },
      ];

      mockDb.where.mockResolvedValue(mockInvoices);

      const caller = dashboardRouter.createCaller(mockContext);
      const result = await caller.getStats();

      expect(result.pendingInvoices).toBe(2);
      expect(result.paidInvoices).toBe(1);
      expect(result.overdueInvoices).toBe(1); // one pending past due
      expect(result.outstandingAmount).toBe("$400.00"); // 100 + 300
      expect(result.recentInvoices).toHaveLength(3);
      expect(result.recentInvoices[0].id).toBe("3"); // most recent
    });

    it("should handle database errors gracefully", async () => {
      mockDb.where.mockRejectedValue(new Error("Database error"));

      const caller = dashboardRouter.createCaller(mockContext);
      const result = await caller.getStats();

      expect(result).toEqual({
        pendingInvoices: 0,
        overdueInvoices: 0,
        paidInvoices: 0,
        outstandingAmount: "$0.00",
        recentInvoices: [],
      });
    });
  });

  describe("getMonthlyData", () => {
    it("should return zero amounts for all months when no invoices exist", async () => {
      mockDb.where.mockResolvedValue([]);

      const caller = dashboardRouter.createCaller(mockContext);
      const result = await caller.getMonthlyData();

      expect(result).toHaveLength(12);
      expect(result[0]).toEqual({ name: "Jan", amount: 0 });
      expect(result.every((month) => month.amount === 0)).toBe(true);
    });

    it("should calculate correct monthly amounts", async () => {
      const currentYear = new Date().getFullYear();
      const mockInvoices = [
        {
          id: "1",
          amount: "100.00",
          issueDate: new Date(currentYear, 0, 15), // January
        },
        {
          id: "2",
          amount: "200.00",
          issueDate: new Date(currentYear, 0, 20), // January
        },
        {
          id: "3",
          amount: "300.00",
          issueDate: new Date(currentYear, 1, 15), // February
        },
      ];

      mockDb.where.mockResolvedValue(mockInvoices);

      const caller = dashboardRouter.createCaller(mockContext);
      const result = await caller.getMonthlyData();

      expect(result[0]).toEqual({ name: "Jan", amount: 300 }); // 100 + 200
      expect(result[1]).toEqual({ name: "Feb", amount: 300 });
      expect(result[2].amount).toBe(0); // March and others should be 0
    });
  });

  describe("getAllDashboardData", () => {
    it("should return combined stats and monthly data", async () => {
      const mockInvoices = [
        {
          id: "1",
          status: "pending",
          amount: "100.00",
          dueDate: new Date("2024-12-01"),
          createdAt: new Date(),
          issueDate: new Date(),
        },
      ];

      mockDb.where.mockResolvedValue(mockInvoices);

      const caller = dashboardRouter.createCaller(mockContext);
      const result = await caller.getAllDashboardData();

      expect(result).toHaveProperty("stats");
      expect(result).toHaveProperty("monthlyData");
      expect(result.stats.pendingInvoices).toBe(1);
      expect(result.monthlyData).toHaveLength(12);
    });
  });

  describe("getRecentActivity", () => {
    it("should return recent activity with default limit", async () => {
      const mockInvoices = [
        {
          id: "1",
          invoiceNumber: "INV-001",
          clientName: "Test Client",
          amount: "100.00",
          currency: "USD",
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.where.mockResolvedValue(mockInvoices);

      const caller = dashboardRouter.createCaller(mockContext);
      const result = await caller.getRecentActivity({ limit: 5 });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "1",
        type: "invoice_created",
        title: "Invoice #INV-001 created",
        status: "pending",
      });
    });

    it("should respect the limit parameter", async () => {
      const mockInvoices = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        invoiceNumber: `INV-${String(i + 1).padStart(3, "0")}`,
        clientName: "Test Client",
        amount: "100.00",
        currency: "USD",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockDb.where.mockResolvedValue(mockInvoices);

      const caller = dashboardRouter.createCaller(mockContext);
      const result = await caller.getRecentActivity({ limit: 5 });

      expect(result).toHaveLength(5);
    });
  });
});
