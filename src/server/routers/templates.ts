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

export const templatesRouter = createTRPCRouter({
  // Get all templates for the authenticated user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const templates = await ctx.db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.userId, ctx.user.id))
        .orderBy(emailTemplates.name);

      return templates as EmailTemplate[];
    } catch (error) {
      console.error("Error getting templates:", error);
      throw new Error("Failed to get templates");
    }
  }),

  // Get template by ID
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
          throw new Error("Template not found");
        }

        return template[0] as EmailTemplate;
      } catch (error) {
        console.error("Error getting template by ID:", error);
        throw new Error("Failed to get template");
      }
    }),

  // Get templates by tone
  getByTone: protectedProcedure
    .input(z.object({ tone: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const templates = await ctx.db
          .select()
          .from(emailTemplates)
          .where(
            and(
              eq(emailTemplates.userId, ctx.user.id),
              eq(emailTemplates.tone, input.tone as any)
            )
          )
          .orderBy(emailTemplates.name);

        return templates as EmailTemplate[];
      } catch (error) {
        console.error("Error getting templates by tone:", error);
        throw new Error("Failed to get templates by tone");
      }
    }),

  // Create new template
  create: protectedProcedure
    .input(createTemplateSchema)
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
          })
          .returning();

        return newTemplate[0] as EmailTemplate;
      } catch (error) {
        console.error("Error creating template:", error);
        throw new Error("Failed to create template");
      }
    }),

  // Update existing template
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateTemplateSchema,
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
          throw new Error("Template not found");
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

        // Update the template
        const updateFields: any = {
          ...input.data,
          updatedAt: new Date(),
        };

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

        return updatedTemplate[0] as EmailTemplate;
      } catch (error) {
        console.error("Error updating template:", error);
        throw new Error("Failed to update template");
      }
    }),

  // Delete template
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
          throw new Error("Template not found");
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
        console.error("Error deleting template:", error);
        throw new Error("Failed to delete template");
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
