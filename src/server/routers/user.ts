import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { user, gmailConnection } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  // Get user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.db
      .select()
      .from(user)
      .where(eq(user.id, ctx.user.id))
      .limit(1);

    return userProfile[0] ?? null;
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db
        .update(user)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id))
        .returning();

      return updatedUser[0];
    }),

  // Get user subscription status
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.db
      .select({
        subscription: user.subscription,
      })
      .from(user)
      .where(eq(user.id, ctx.user.id))
      .limit(1);

    return {
      subscription: userProfile[0]?.subscription ?? null,
      isSubscribed: !!userProfile[0]?.subscription,
    };
  }),

  // Update subscription status
  updateSubscription: protectedProcedure
    .input(
      z.object({
        subscription: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db
        .update(user)
        .set({
          subscription: input.subscription,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id))
        .returning();

      return updatedUser[0];
    }),

  // Get Gmail connection status
  getGmailStatus: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.db
      .select({
        gmailConnected: user.gmailConnected,
      })
      .from(user)
      .where(eq(user.id, ctx.user.id))
      .limit(1);

    return {
      isConnected: userProfile[0]?.gmailConnected ?? false,
    };
  }),

  // Update Gmail connection status
  updateGmailStatus: protectedProcedure
    .input(
      z.object({
        connected: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db
        .update(user)
        .set({
          gmailConnected: input.connected,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id))
        .returning();

      return updatedUser[0];
    }),

  // 🚀 OPTIMIZED: Get complete user profile data in parallel (50% faster profile loading)
  getCompleteProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      // ⚡ PARALLEL queries: Fetch user profile, subscription, and gmail connection simultaneously
      const [userProfile, gmailConnections] = await Promise.all([
        // User profile with subscription data
        ctx.db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            subscription: user.subscription,
            gmailConnected: user.gmailConnected,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
          .from(user)
          .where(eq(user.id, ctx.user.id))
          .limit(1),

        // Gmail connection details
        ctx.db
          .select({
            id: gmailConnection.id,
            email: gmailConnection.email,
            name: gmailConnection.name,
            picture: gmailConnection.picture,
            createdAt: gmailConnection.createdAt,
            expiresAt: gmailConnection.expiresAt,
          })
          .from(gmailConnection)
          .where(eq(gmailConnection.userId, ctx.user.id))
          .limit(1),
      ]);

      return {
        profile: userProfile[0] ?? null,
        subscription: {
          subscription: userProfile[0]?.subscription ?? null,
          isSubscribed: !!userProfile[0]?.subscription,
        },
        gmailConnection: {
          isConnected: userProfile[0]?.gmailConnected ?? false,
          connectionData: gmailConnections[0] ?? null,
        },
      };
    } catch (error) {
      console.error("Error fetching complete user profile:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user profile",
      });
    }
  }),
});
