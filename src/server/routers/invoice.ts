import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { clientInvoices, invoiceStatusEnum } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { invoiceFormSchema } from "@/lib/validations/invoice";
import { TRPCError } from "@trpc/server";

export const invoiceRouter = createTRPCRouter({
  // Get all invoices for the user
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const invoices = await ctx.db
          .select()
          .from(clientInvoices)
          .where(eq(clientInvoices.userId, ctx.user.id))
          .limit(input.limit)
          .offset(input.offset);

        return invoices;
      } catch (error) {
        console.error("Error fetching invoices:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch invoices",
        });
      }
    }),

  // Get invoices by status
  getByStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "paid", "overdue", "all"]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Fetch all user invoices
        const userInvoices = await ctx.db
          .select()
          .from(clientInvoices)
          .where(eq(clientInvoices.userId, ctx.user.id));

        const now = new Date();
        let filteredInvoices;

        if (input.status === "all") {
          filteredInvoices = userInvoices;
        } else if (input.status === "overdue") {
          filteredInvoices = userInvoices.filter(
            (invoice) => invoice.status === "pending" && invoice.dueDate < now
          );
        } else {
          filteredInvoices = userInvoices.filter(
            (invoice) => invoice.status === input.status
          );
        }

        return filteredInvoices;
      } catch (error) {
        console.error(`Error fetching ${input.status} invoices:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch ${input.status} invoices`,
        });
      }
    }),

  // Get a single invoice by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const invoice = await ctx.db
          .select()
          .from(clientInvoices)
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (invoice.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Invoice not found or you do not have permission to access it",
          });
        }

        return invoice[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching invoice:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch invoice",
        });
      }
    }),

  // Create a new invoice
  create: protectedProcedure
    .input(invoiceFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse dates from strings
        const issueDate = new Date(input.issueDate);
        const dueDate = new Date(input.dueDate);

        // Insert new invoice
        const newInvoice = await ctx.db
          .insert(clientInvoices)
          .values({
            id: uuidv4(),
            userId: ctx.user.id,
            clientName: input.clientName,
            clientEmail: input.clientEmail,
            invoiceNumber: input.invoiceNumber,
            amount: String(input.amount),
            currency: input.currency,
            issueDate,
            dueDate,
            description: input.description || "",
            additionalNotes: input.additionalNotes || "",
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          success: true,
          invoice: newInvoice[0],
        };
      } catch (error) {
        console.error("Error creating invoice:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create invoice",
        });
      }
    }),

  // Update an existing invoice
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: invoiceFormSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the invoice belongs to the user
        const existingInvoice = await ctx.db
          .select()
          .from(clientInvoices)
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          );

        if (existingInvoice.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Invoice not found or you do not have permission to update it",
          });
        }

        // Parse dates from strings
        const issueDate = new Date(input.data.issueDate);
        const dueDate = new Date(input.data.dueDate);

        // Update the invoice
        const updatedInvoice = await ctx.db
          .update(clientInvoices)
          .set({
            clientName: input.data.clientName,
            clientEmail: input.data.clientEmail,
            invoiceNumber: input.data.invoiceNumber,
            amount: String(input.data.amount),
            currency: input.data.currency,
            issueDate,
            dueDate,
            description: input.data.description || "",
            additionalNotes: input.data.additionalNotes || "",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          )
          .returning();

        return {
          success: true,
          invoice: updatedInvoice[0],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating invoice:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update invoice",
        });
      }
    }),

  // Delete an invoice
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the invoice belongs to the user
        const invoice = await ctx.db
          .select()
          .from(clientInvoices)
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          );

        if (invoice.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Invoice not found or you do not have permission to delete it",
          });
        }

        // Delete the invoice
        await ctx.db
          .delete(clientInvoices)
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting invoice:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete invoice",
        });
      }
    }),

  // Update invoice status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(invoiceStatusEnum.enumValues),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the invoice belongs to the user
        const invoice = await ctx.db
          .select()
          .from(clientInvoices)
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          );

        if (invoice.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Invoice not found or you do not have permission to update it",
          });
        }

        // Update the invoice status
        const updatedInvoice = await ctx.db
          .update(clientInvoices)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          )
          .returning();

        return {
          success: true,
          invoice: updatedInvoice[0],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating invoice status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update invoice status",
        });
      }
    }),

  // Mark invoice as paid (convenience method)
  markAsPaid: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the invoice belongs to the user
        const invoice = await ctx.db
          .select()
          .from(clientInvoices)
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          );

        if (invoice.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Invoice not found or you do not have permission to update it",
          });
        }

        // Update the invoice status to paid
        const updatedInvoice = await ctx.db
          .update(clientInvoices)
          .set({
            status: "paid",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(clientInvoices.id, input.id),
              eq(clientInvoices.userId, ctx.user.id)
            )
          )
          .returning();

        return {
          success: true,
          invoice: updatedInvoice[0],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error marking invoice as paid:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark invoice as paid",
        });
      }
    }),

  // Bulk operations
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()).min(1),
        status: z.enum(invoiceStatusEnum.enumValues),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First verify all invoices belong to the user
        const invoices = await ctx.db
          .select({ id: clientInvoices.id })
          .from(clientInvoices)
          .where(eq(clientInvoices.userId, ctx.user.id));

        const userInvoiceIds = new Set(invoices.map((inv) => inv.id));
        const invalidIds = input.ids.filter((id) => !userInvoiceIds.has(id));

        if (invalidIds.length > 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You do not have permission to update invoices: ${invalidIds.join(", ")}`,
          });
        }

        // Update all valid invoices
        const updatedInvoices = [];
        for (const id of input.ids) {
          const updated = await ctx.db
            .update(clientInvoices)
            .set({
              status: input.status,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(clientInvoices.id, id),
                eq(clientInvoices.userId, ctx.user.id)
              )
            )
            .returning();

          if (updated.length > 0) {
            updatedInvoices.push(updated[0]);
          }
        }

        return {
          success: true,
          updatedCount: updatedInvoices.length,
          invoices: updatedInvoices,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error bulk updating invoice status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk update invoice status",
        });
      }
    }),

  // Check if invoice number exists (for validation)
  checkInvoiceNumber: protectedProcedure
    .input(
      z.object({
        invoiceNumber: z.string(),
        excludeId: z.string().optional(), // For editing - exclude current invoice
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const existingInvoice = await ctx.db
          .select({ id: clientInvoices.id })
          .from(clientInvoices)
          .where(
            and(
              eq(clientInvoices.userId, ctx.user.id),
              eq(clientInvoices.invoiceNumber, input.invoiceNumber),
              input.excludeId
                ? ne(clientInvoices.id, input.excludeId)
                : undefined
            )
          )
          .limit(1);

        return {
          exists: existingInvoice.length > 0,
          invoiceId: existingInvoice[0]?.id,
        };
      } catch (error) {
        console.error("Error checking invoice number:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check invoice number",
        });
      }
    }),

  // Get unique clients for suggestions
  getUniqueClients: protectedProcedure.query(async ({ ctx }) => {
    try {
      const invoices = await ctx.db
        .select({
          clientName: clientInvoices.clientName,
          clientEmail: clientInvoices.clientEmail,
        })
        .from(clientInvoices)
        .where(eq(clientInvoices.userId, ctx.user.id));

      // Create a map to deduplicate clients by email
      const clientMap = new Map();

      invoices.forEach((invoice) => {
        const key = invoice.clientEmail.toLowerCase();
        if (!clientMap.has(key)) {
          clientMap.set(key, {
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
          });
        }
      });

      return Array.from(clientMap.values());
    } catch (error) {
      console.error("Error fetching unique clients:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch unique clients",
      });
    }
  }),

  // Bulk delete
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First verify all invoices belong to the user
        const invoices = await ctx.db
          .select({ id: clientInvoices.id })
          .from(clientInvoices)
          .where(eq(clientInvoices.userId, ctx.user.id));

        const userInvoiceIds = new Set(invoices.map((inv) => inv.id));
        const invalidIds = input.ids.filter((id) => !userInvoiceIds.has(id));

        if (invalidIds.length > 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You do not have permission to delete invoices: ${invalidIds.join(", ")}`,
          });
        }

        // Delete all valid invoices
        let deletedCount = 0;
        for (const id of input.ids) {
          const result = await ctx.db
            .delete(clientInvoices)
            .where(
              and(
                eq(clientInvoices.id, id),
                eq(clientInvoices.userId, ctx.user.id)
              )
            );

          deletedCount++;
        }

        return {
          success: true,
          deletedCount,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error bulk deleting invoices:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk delete invoices",
        });
      }
    }),
});
