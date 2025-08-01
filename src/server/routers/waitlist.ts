import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db/drizzle";
import { waitlist } from "@/db/schema";
import { eq } from "drizzle-orm";

// Validation schema for waitlist signup
const waitlistSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const waitlistRouter = createTRPCRouter({
  // Sign up for waitlist
  signup: publicProcedure
    .input(waitlistSignupSchema)
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existingEntry = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, input.email))
        .limit(1);

      if (existingEntry.length > 0) {
        throw new Error("This email is already on the waitlist!");
      }

      // Insert new waitlist entry
      const newEntry = await db
        .insert(waitlist)
        .values({
          email: input.email,
        })
        .returning();

      return {
        success: true,
        message: "Successfully joined the waitlist!",
        data: { id: newEntry[0].id, email: newEntry[0].email },
      };
    }),

  // Get waitlist count
  getCount: publicProcedure.query(async () => {
    const count = await db.$count(waitlist);
    return { count };
  }),

  // Get all waitlist entries (admin only - for future use)
  getAll: publicProcedure.query(async () => {
    const entries = await db
      .select({
        id: waitlist.id,
        email: waitlist.email,
        createdAt: waitlist.createdAt,
      })
      .from(waitlist)
      .orderBy(waitlist.createdAt);

    return { entries };
  }),
});
