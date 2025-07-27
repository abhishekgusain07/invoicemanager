"use server";
import { db } from "@/db/drizzle";
import { gmailConnection } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getUserRefreshToken(
  userId: string
): Promise<string | null> {
  try {
    const [connection] = await db
      .select()
      .from(gmailConnection)
      .where(eq(gmailConnection.userId, userId))
      .orderBy(desc(gmailConnection.createdAt))
      .limit(1);

    return connection?.refreshToken || null;
  } catch (error) {
    console.error("Error getting user refresh token:", error);
    return null;
  }
}
