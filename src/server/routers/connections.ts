import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { gmailConnection, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export const connectionsRouter = createTRPCRouter({
  // Check Gmail connection status
  checkGmailConnection: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user has a Gmail connection record
      const connection = await ctx.db
        .select()
        .from(gmailConnection)
        .where(eq(gmailConnection.userId, ctx.user.id))
        .limit(1);

      // Also check user's gmailConnected flag
      const userRecord = await ctx.db
        .select({ gmailConnected: user.gmailConnected })
        .from(user)
        .where(eq(user.id, ctx.user.id))
        .limit(1);

      const hasConnection = connection.length > 0;
      const isConnectedFlag = userRecord[0]?.gmailConnected ?? false;

      return {
        isConnected: hasConnection && isConnectedFlag,
        connectionData: hasConnection
          ? {
              email: connection[0].email,
              name: connection[0].name,
              connectedAt: connection[0].createdAt,
            }
          : null,
      };
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      return {
        isConnected: false,
        connectionData: null,
      };
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
        .update(user)
        .set({
          gmailConnected: false,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id));

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
        .select({ gmailConnected: user.gmailConnected })
        .from(user)
        .where(eq(user.id, ctx.user.id))
        .limit(1);

      const hasConnection = connection.length > 0;
      const isConnectedFlag = userRecord[0]?.gmailConnected ?? false;

      // Update user record if connection state is inconsistent
      if (hasConnection !== isConnectedFlag) {
        await ctx.db
          .update(user)
          .set({
            gmailConnected: hasConnection,
            updatedAt: new Date(),
          })
          .where(eq(user.id, ctx.user.id));
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
});
