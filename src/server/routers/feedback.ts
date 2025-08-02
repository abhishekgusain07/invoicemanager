import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { feedback, featureRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

const feedbackSchema = z.object({
  feedbackContent: z.string().min(5).max(500),
  stars: z.number().min(1).max(5),
});

const featureRequestSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  priority: z.enum(["low", "medium", "high"]),
});

export const feedbackRouter = createTRPCRouter({
  // Submit feedback (migrated from server action)
  submitFeedback: protectedProcedure
    .input(feedbackSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Insert into database
        const newFeedback = await ctx.db
          .insert(feedback)
          .values({
            id: nanoid(),
            feedbackContent: input.feedbackContent,
            stars: input.stars,
            userId: ctx.user.id,
            createdTime: new Date(),
          })
          .returning();

        return {
          success: true,
          feedback: newFeedback[0],
        };
      } catch (error) {
        console.error("Failed to submit feedback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit feedback. Please try again.",
        });
      }
    }),

  // Submit feature request (migrated from server action)
  submitFeatureRequest: protectedProcedure
    .input(
      featureRequestSchema.extend({
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Insert into dedicated feature requests table
        const newFeatureRequest = await ctx.db
          .insert(featureRequests)
          .values({
            id: nanoid(),
            title: input.title,
            description: input.description,
            priority: input.priority as "low" | "medium" | "high",
            userId: input.userId || ctx.user.id,
            createdTime: new Date(),
            updatedTime: new Date(),
            status: "new", // Default status for new feature requests
          })
          .returning();

        return {
          success: true,
          featureRequest: newFeatureRequest[0],
        };
      } catch (error) {
        console.error("Failed to submit feature request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit feature request. Please try again.",
        });
      }
    }),

  // Get user's feedback history
  getUserFeedback: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userFeedback = await ctx.db
        .select()
        .from(feedback)
        .where(eq(feedback.userId, ctx.user.id))
        .orderBy(desc(feedback.createdTime));

      return {
        success: true,
        feedback: userFeedback,
      };
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch feedback history",
      });
    }
  }),

  // Get user's feature requests
  getUserFeatureRequests: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userRequests = await ctx.db
        .select()
        .from(featureRequests)
        .where(eq(featureRequests.userId, ctx.user.id))
        .orderBy(desc(featureRequests.createdTime));

      return {
        success: true,
        requests: userRequests,
      };
    } catch (error) {
      console.error("Error fetching user feature requests:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch feature requests",
      });
    }
  }),

  // Update feature request status (for admin use)
  updateFeatureRequestStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "new",
          "under_review",
          "planned",
          "in_progress",
          "completed",
          "declined",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedRequest = await ctx.db
          .update(featureRequests)
          .set({
            status: input.status,
            updatedTime: new Date(),
          })
          .where(eq(featureRequests.id, input.id))
          .returning();

        if (updatedRequest.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Feature request not found",
          });
        }

        return {
          success: true,
          request: updatedRequest[0],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating feature request status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update feature request status",
        });
      }
    }),
});
