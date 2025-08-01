import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { waitlist } from "@/db/schema";

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
