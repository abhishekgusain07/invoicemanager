import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  // Get current session
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  // Get current user
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  // Check if user is authenticated
  isAuthenticated: publicProcedure.query(({ ctx }) => {
    return {
      isAuthenticated: !!ctx.session?.user,
      user: ctx.session?.user ?? null,
    };
  }),

  // Health check for authentication
  healthCheck: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),
});
