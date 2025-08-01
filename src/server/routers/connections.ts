import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { gmailConnection, user as userSchema } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export type GmailConnectionData = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  picture: string | null;
  createdAt: Date;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  [key: string]: string | number | Date | null;
};

export const connectionsRouter = createTRPCRouter({
  // Check Gmail connection status (migrated from server action)
  checkGmailConnection: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connections = await ctx.db
        .select()
        .from(gmailConnection)
        .where(eq(gmailConnection.userId, ctx.user.id));

      const isConnected = connections.length > 0;
      const connectionData = isConnected ? connections[0] : null;

      if (isConnected) {
        // Update user's gmailConnected status if needed
        await ctx.db
          .update(userSchema)
          .set({ gmailConnected: true })
          .where(eq(userSchema.id, ctx.user.id));
      }

      return {
        isConnected,
        connectionData: connectionData as GmailConnectionData | null,
      };
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check Gmail connection status",
      });
    }
  }),

  // Get Gmail connection data
  getGmailConnectionData: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connection = await ctx.db
        .select()
        .from(gmailConnection)
        .where(eq(gmailConnection.userId, ctx.user.id))
        .limit(1);

      if (connection.length === 0) {
        return null;
      }

      return {
        id: connection[0].id,
        email: connection[0].email,
        name: connection[0].name,
        picture: connection[0].picture,
        scope: connection[0].scope,
        connectedAt: connection[0].createdAt,
        updatedAt: connection[0].updatedAt,
      };
    } catch (error) {
      console.error("Error fetching Gmail connection data:", error);
      return null;
    }
  }),

  // Disconnect Gmail
  disconnectGmail: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Remove Gmail connection record
      await ctx.db
        .delete(gmailConnection)
        .where(eq(gmailConnection.userId, ctx.user.id));

      // Update user's gmailConnected flag
      await ctx.db
        .update(userSchema)
        .set({
          gmailConnected: false,
          updatedAt: new Date(),
        })
        .where(eq(userSchema.id, ctx.user.id));

      return { success: true };
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
      return { success: false, error: "Failed to disconnect Gmail" };
    }
  }),

  // Refresh connection status (useful for polling)
  refreshConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      // This is essentially the same as checkGmailConnection but with fresh data
      const connection = await ctx.db
        .select()
        .from(gmailConnection)
        .where(eq(gmailConnection.userId, ctx.user.id))
        .limit(1);

      const userRecord = await ctx.db
        .select({ gmailConnected: userSchema.gmailConnected })
        .from(userSchema)
        .where(eq(userSchema.id, ctx.user.id))
        .limit(1);

      const hasConnection = connection.length > 0;
      const isConnectedFlag = userRecord[0]?.gmailConnected ?? false;

      // Update user record if connection state is inconsistent
      if (hasConnection !== isConnectedFlag) {
        await ctx.db
          .update(userSchema)
          .set({
            gmailConnected: hasConnection,
            updatedAt: new Date(),
          })
          .where(eq(userSchema.id, ctx.user.id));
      }

      return {
        isConnected: hasConnection,
        wasUpdated: hasConnection !== isConnectedFlag,
        connectionData: hasConnection
          ? {
              email: connection[0].email,
              name: connection[0].name,
              connectedAt: connection[0].createdAt,
            }
          : null,
      };
    } catch (error) {
      console.error("Error refreshing connection status:", error);
      return {
        isConnected: false,
        wasUpdated: false,
        connectionData: null,
      };
    }
  }),

  // Get user refresh token (migrated from server action)
  getRefreshToken: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connection = await ctx.db
        .select()
        .from(gmailConnection)
        .where(eq(gmailConnection.userId, ctx.user.id))
        .orderBy(desc(gmailConnection.createdAt))
        .limit(1);

      return connection[0]?.refreshToken || null;
    } catch (error) {
      console.error("Error getting user refresh token:", error);
      return null;
    }
  }),

  // Test Gmail connection
  testGmailConnection: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const connection = await ctx.db
        .select()
        .from(gmailConnection)
        .where(eq(gmailConnection.userId, ctx.user.id))
        .limit(1);

      if (connection.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Gmail connection found",
        });
      }

      // Check if token is expired
      const isExpired = new Date() > connection[0].expiresAt;

      return {
        success: true,
        isExpired,
        connectionData: connection[0] as GmailConnectionData,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Error testing Gmail connection:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to test Gmail connection",
      });
    }
  }),

  // Get all connections for the user
  getAllConnections: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connections = await ctx.db
        .select({
          id: gmailConnection.id,
          email: gmailConnection.email,
          name: gmailConnection.name,
          picture: gmailConnection.picture,
          createdAt: gmailConnection.createdAt,
          updatedAt: gmailConnection.updatedAt,
          expiresAt: gmailConnection.expiresAt,
        })
        .from(gmailConnection)
        .where(eq(gmailConnection.userId, ctx.user.id))
        .orderBy(desc(gmailConnection.createdAt));

      return {
        success: true,
        connections,
      };
    } catch (error) {
      console.error("Error fetching all connections:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch connections",
      });
    }
  }),
});
