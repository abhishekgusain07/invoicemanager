"use server";

import { db } from "@/db/drizzle";
import { user as userSchema, gmailConnection } from "@/db/schema";
import { eq } from "drizzle-orm";

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
  [key: string]: any;
};

export async function checkGmailConnection(userId: string): Promise<{ 
  isConnected: boolean; 
  connectionData: GmailConnectionData | null 
}> {
  try {
    const connections = await db.select()
      .from(gmailConnection)
      .where(eq(gmailConnection.userId, userId));
    
    const isConnected = connections.length > 0;
    const connectionData = isConnected ? connections[0] : null;
    
    if (isConnected) {
      // Update user's gmailConnected status if needed
      await db.update(userSchema)
        .set({ gmailConnected: true })
        .where(eq(userSchema.id, userId));
    }
    
    return { 
      isConnected, 
      connectionData 
    };
  } catch (error) {
    console.error("Error checking Gmail connection:", error);
    throw new Error("Failed to check Gmail connection status");
  }
} 