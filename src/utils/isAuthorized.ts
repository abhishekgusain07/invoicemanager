"use server";

import config from "@/config";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

import { headers } from "next/headers";
export const isAuthorized = async (
  userId: string
): Promise<{ authorized: boolean; message: string }> => {
  console.log("GET HIT");
  if (!config?.payments?.enabled) {
    console.log("Payments are disabled");
    return {
      authorized: true,
      message: "Payments are disabled",
    };
  }
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const result = await session?.user.id;

  if (!result) {
    return {
      authorized: false,
      message: "User not found",
    };
  }

  try {
    const data = await db.select().from(user).where(eq(user.id, result));

    if (data?.[0]?.subscription) {
      return {
        authorized: true,
        message: "User is authorized",
      };
    }

    return {
      authorized: false,
      message: "User is not subscribed",
    };
  } catch (error: any) {
    return {
      authorized: false,
      message: error.message,
    };
  }
};
