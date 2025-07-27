import { NextRequest, NextResponse } from "next/server";

import { gmailConnection } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;
  if (!userId) {
    throw new Error("User not found, Login First");
  }

  // Check if a Gmail connection exists for this user
  const existingConnection = await db
    .select()
    .from(gmailConnection)
    .where(eq(gmailConnection.userId, userId))
    .limit(1);
  if (existingConnection.length == 0) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: existingConnection.length > 0 });
}
