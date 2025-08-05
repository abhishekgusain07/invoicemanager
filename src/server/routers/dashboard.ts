import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { clientInvoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dashboardRouter = createTRPCRouter({
  // Get invoice statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Fetch all user invoices using typed query
      const userInvoices = await ctx.db
        .select()
        .from(clientInvoices)
        .where(eq(clientInvoices.userId, ctx.user.id));

      // Count invoices by status
      const pendingInvoices = userInvoices.filter(
        (invoice) => invoice.status === "pending"
      ).length;
      const paidInvoices = userInvoices.filter(
        (invoice) => invoice.status === "paid"
      ).length;

      // Calculate overdue invoices (due date has passed and not paid)
      const now = new Date();
      const overdueInvoices = userInvoices.filter(
        (invoice) => invoice.status === "pending" && invoice.dueDate < now
      ).length;

      // Calculate total outstanding amount (all unpaid invoices)
      const outstandingTotal = userInvoices
        .filter((invoice) => invoice.status !== "paid")
        .reduce(
          (sum, invoice) => sum + parseFloat(invoice.amount as string),
          0
        );

      // Format with currency symbol, assuming USD for now
      const outstandingAmount = `$${outstandingTotal.toFixed(2)}`;

      // Get most recent 5 invoices
      const recentInvoices = [...userInvoices]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      return {
        pendingInvoices,
        overdueInvoices,
        paidInvoices,
        outstandingAmount,
        recentInvoices,
      };
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      return {
        pendingInvoices: 0,
        overdueInvoices: 0,
        paidInvoices: 0,
        outstandingAmount: "$0.00",
        recentInvoices: [],
      };
    }
  }),

  // Get monthly invoice data for charts
  getMonthlyData: protectedProcedure.query(async ({ ctx }) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    try {
      // Fetch all user invoices
      const userInvoices = await ctx.db
        .select()
        .from(clientInvoices)
        .where(eq(clientInvoices.userId, ctx.user.id));

      // Get current year
      const currentYear = new Date().getFullYear();

      // Create monthly data for the current year
      const monthlyData = months.map((month, index) => {
        // Get all invoices created in this month of the current year
        const monthInvoices = userInvoices.filter((invoice) => {
          const issueDate = invoice.issueDate;
          return (
            issueDate.getMonth() === index &&
            issueDate.getFullYear() === currentYear
          );
        });

        // Calculate total amount
        const amount = monthInvoices.reduce(
          (sum, invoice) => sum + parseFloat(invoice.amount as string),
          0
        );

        return {
          name: month,
          amount,
        };
      });

      return monthlyData;
    } catch (error) {
      console.error("Error fetching monthly invoice data:", error);
      return months.map((month) => ({ name: month, amount: 0 }));
    }
  }),

  // 🚀 OPTIMIZED: Combined endpoint for all dashboard data (67% query reduction)
  getAllDashboardData: protectedProcedure.query(async ({ ctx }) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();
    const now = new Date();

    try {
      // ✅ SINGLE database query to fetch all user invoices (replaces 3 separate queries)
      const userInvoices = await ctx.db
        .select()
        .from(clientInvoices)
        .where(eq(clientInvoices.userId, ctx.user.id));

      // ⚡ Optimized: Single-pass processing for all statistics
      let pendingInvoices = 0;
      let paidInvoices = 0;
      let overdueInvoices = 0;
      let outstandingTotal = 0;
      const monthlyTotals = new Array(12).fill(0);

      // Single loop processes all data (instead of multiple filter operations)
      for (const invoice of userInvoices) {
        const amount = parseFloat(invoice.amount as string);
        const issueMonth = invoice.issueDate.getMonth();
        const issueYear = invoice.issueDate.getFullYear();

        // Status counting
        if (invoice.status === "pending") {
          pendingInvoices++;
          if (invoice.dueDate < now) overdueInvoices++;
          outstandingTotal += amount;
        } else if (invoice.status === "paid") {
          paidInvoices++;
        } else {
          // Other non-paid statuses contribute to outstanding
          outstandingTotal += amount;
        }

        // Monthly data calculation (current year only)
        if (issueYear === currentYear) {
          monthlyTotals[issueMonth] += amount;
        }
      }

      // Most recent invoices (single sort operation)
      const recentInvoices = userInvoices
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      // Build monthly data array
      const monthlyData = months.map((month, index) => ({
        name: month,
        amount: monthlyTotals[index],
      }));

      return {
        stats: {
          pendingInvoices,
          overdueInvoices,
          paidInvoices,
          outstandingAmount: `$${outstandingTotal.toFixed(2)}`,
          recentInvoices,
        },
        monthlyData,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return {
        stats: {
          pendingInvoices: 0,
          overdueInvoices: 0,
          paidInvoices: 0,
          outstandingAmount: "$0.00",
          recentInvoices: [],
        },
        monthlyData: months.map((month) => ({ name: month, amount: 0 })),
      };
    }
  }),

  // Get recent activity (placeholder for future features)
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // For now, just return recent invoices with activity type
        const userInvoices = await ctx.db
          .select()
          .from(clientInvoices)
          .where(eq(clientInvoices.userId, ctx.user.id));

        const recentActivity = [...userInvoices]
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, input.limit)
          .map((invoice) => ({
            id: invoice.id,
            type: "invoice_created" as const,
            title: `Invoice #${invoice.invoiceNumber} created`,
            description: `Invoice for ${invoice.clientName} - ${invoice.currency} ${parseFloat(invoice.amount as string).toFixed(2)}`,
            timestamp: invoice.createdAt,
            status: invoice.status,
          }));

        return recentActivity;
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
      }
    }),
});
