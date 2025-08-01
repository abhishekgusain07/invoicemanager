import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { waitlist } from "@/db/schema";
import { eq } from "drizzle-orm";

// Validation schema for waitlist signup
const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(key, { count: 1, resetTime: now + 60 * 60 * 1000 }); // 1 hour
    return true;
  }

  if (limit.count >= 3) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.ip || request.headers.get("x-forwarded-for") || "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = waitlistSchema.parse(body);

    // Check if email already exists
    const existingEntry = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, validatedData.email))
      .limit(1);

    if (existingEntry.length > 0) {
      return NextResponse.json(
        { error: "This email is already on the waitlist!" },
        { status: 409 }
      );
    }

    // Insert new waitlist entry
    const newEntry = await db
      .insert(waitlist)
      .values({
        email: validatedData.email,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the waitlist!",
        data: { id: newEntry[0].id, email: newEntry[0].email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist signup error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get total count of waitlist signups
    const count = await db.$count(waitlist);

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Waitlist count error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist count" },
      { status: 500 }
    );
  }
}
