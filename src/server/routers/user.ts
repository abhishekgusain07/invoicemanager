import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
});