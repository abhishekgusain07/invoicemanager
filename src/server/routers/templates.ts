import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { emailTemplates } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  createTemplateSchema,
  updateTemplateSchema,
  type EmailTemplate,
} from "@/lib/validations/email-template";
import { TRPCError } from "@trpc/server";

export const templatesRouter = createTRPCRouter({
  // Get all templates for the authenticated user (migrated from server action)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const templates = await ctx.db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, ctx.user.id))
        .orderBy(emailTemplates.name);

      return {
        success: true,
        data: templates as EmailTemplate[],
        error: null,
      };
    } catch (error) {
      console.error("Error getting templates:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get templates",
      });
    }
  }),

  // Get template by ID (migrated from server action)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const template = await ctx.db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.id, input.id),
              eq(emailTemplates.userId, ctx.user.id)
            )
          );

        if (!template || template.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template not found",
          });
        }

        return {
          success: true,
          data: template[0] as EmailTemplate,
          error: null,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error getting template by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get template",
        });
      }
    }),

  // Get templates by tone (migrated from server action)
  getByTone: protectedProcedure
    .input(
      z.object({
        tone: z.enum([
          "polite",
          "friendly",
          "neutral",
          "firm",
          "direct",
          "assertive",
          "urgent",
          "final",
          "serious",
        ]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const templates = await ctx.db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.userId, ctx.user.id),
              eq(emailTemplates.tone, input.tone)
            )
          )
          .orderBy(emailTemplates.name);

        return {
          success: true,
          data: templates as EmailTemplate[],
          error: null,
        };
      } catch (error) {
        console.error("Error getting templates by tone:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get templates by tone",
        });
      }
    }),

  // Create new template (migrated from server action)
  create: protectedProcedure
    .input(createTemplateSchema.omit({ userId: true }))
    .mutation(async ({ ctx, input }) => {
      try {
        // If this is a default template, unset other defaults with the same tone
        if (input.isDefault) {
          await ctx.db
            .update(emailTemplates)
            .set({ isDefault: false })
            .where(
              and(
                eq(emailTemplates.userId, ctx.user.id),
                eq(emailTemplates.tone, input.tone as any)
              )
            );
        }

        // Create the template
        const newTemplate = await ctx.db
          .insert(emailTemplates)
          .values({
            id: uuidv4(),
            ...input,
            userId: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          success: true,
          data: newTemplate[0] as EmailTemplate,
        };
      } catch (error) {
        console.error("Error creating template:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create template",
        });
      }
    }),

  // Update existing template (migrated from server action)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateTemplateSchema.omit({ id: true, userId: true }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the template exists and belongs to the user
        const existingTemplate = await ctx.db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.id, input.id),
              eq(emailTemplates.userId, ctx.user.id)
            )
          );

        if (!existingTemplate || existingTemplate.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template not found",
          });
        }

        // If this is a default template, unset other defaults with the same tone
        if (input.data.isDefault) {
          await ctx.db
            .update(emailTemplates)
            .set({ isDefault: false })
            .where(
              and(
                eq(emailTemplates.userId, ctx.user.id),
                eq(emailTemplates.tone, input.data.tone as any),
                not(eq(emailTemplates.id, input.id))
              )
            );
        }

        // Update the template with all provided fields
        const updateFields: any = {
          updatedAt: new Date(),
        };

        // Only update fields that are provided
        if (input.data.name) updateFields.name = input.data.name;
        if (input.data.subject) updateFields.subject = input.data.subject;
        if (input.data.content) updateFields.content = input.data.content;
        if (input.data.htmlContent !== undefined)
          updateFields.htmlContent = input.data.htmlContent;
        if (input.data.textContent !== undefined)
          updateFields.textContent = input.data.textContent;
        if (input.data.description !== undefined)
          updateFields.description = input.data.description;
        if (input.data.tone) updateFields.tone = input.data.tone;
        if (input.data.category) updateFields.category = input.data.category;
        if (input.data.isDefault !== undefined)
          updateFields.isDefault = input.data.isDefault;

        const updatedTemplate = await ctx.db
          .update(emailTemplates)
          .set(updateFields)
          .where(
            and(
              eq(emailTemplates.id, input.id),
              eq(emailTemplates.userId, ctx.user.id)
            )
          )
          .returning();

        return {
          success: true,
          data: updatedTemplate[0] as EmailTemplate,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating template:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update template",
        });
      }
    }),

  // Delete template (migrated from server action)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the template exists and belongs to the user
        const existingTemplate = await ctx.db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.id, input.id),
              eq(emailTemplates.userId, ctx.user.id)
            )
          );

        if (!existingTemplate || existingTemplate.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template not found",
          });
        }

        // Delete the template
        await ctx.db
          .delete(emailTemplates)
          .where(
            and(
              eq(emailTemplates.id, input.id),
              eq(emailTemplates.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting template:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete template",
        });
      }
    }),

  // Toggle template active status
  toggleActive: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedTemplate = await ctx.db
          .update(emailTemplates)
          .set({
            isActive: input.isActive,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(emailTemplates.id, input.id),
              eq(emailTemplates.userId, ctx.user.id)
            )
          )
          .returning();

        if (!updatedTemplate || updatedTemplate.length === 0) {
          throw new Error("Template not found");
        }

        return updatedTemplate[0] as EmailTemplate;
      } catch (error) {
        console.error("Error toggling template status:", error);
        throw new Error("Failed to update template status");
      }
    }),

  // Get templates with usage statistics (useful for analytics)
  getWithStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const templates = await ctx.db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, ctx.user.id))
        .orderBy(emailTemplates.usageCount);

      // Calculate statistics
      const stats = {
        totalTemplates: templates.length,
        activeTemplates: templates.filter((t) => t.isActive !== false).length,
        defaultTemplates: templates.filter((t) => t.isDefault).length,
        byCategory: templates.reduce(
          (acc, template) => {
            const category = template.category || "other";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        byTone: templates.reduce(
          (acc, template) => {
            const tone = template.tone || "neutral";
            acc[tone] = (acc[tone] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      };

      return {
        templates: templates as EmailTemplate[],
        stats,
      };
    } catch (error) {
      console.error("Error getting templates with stats:", error);
      throw new Error("Failed to get templates with statistics");
    }
  }),
});
