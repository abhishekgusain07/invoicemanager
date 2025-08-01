import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { waitlist } from "@/db/schema";
import { sql } from "drizzle-orm";

// Simple auth check - in production, use proper authentication
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  
  if (!adminKey) {
    return false;
  }
  
  return authHeader === `Bearer ${adminKey}`;
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get total count
    const totalCount = await db.$count(waitlist);

    // Get signups by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const signupsByDay = await db
      .select({
        date: sql<string>`DATE(${waitlist.createdAt})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(waitlist)
      .where(sql`${waitlist.createdAt} >= ${thirtyDaysAgo}`)
      .groupBy(sql`DATE(${waitlist.createdAt})`)
      .orderBy(sql`DATE(${waitlist.createdAt}) DESC`);

    // Get top email domains
    const emailDomains = await db
      .select({
        domain: sql<string>`SPLIT_PART(${waitlist.email}, '@', 2)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(waitlist)
      .groupBy(sql`SPLIT_PART(${waitlist.email}, '@', 2)`)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    // Recent signups
    const recentSignups = await db
      .select({
        email: waitlist.email,
        createdAt: waitlist.createdAt,
      })
      .from(waitlist)
      .orderBy(sql`${waitlist.createdAt} DESC`)
      .limit(20);

    // Calculate growth metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const lastWeekCount = await db
      .$count(waitlist, sql`${waitlist.createdAt} >= ${sevenDaysAgo}`);
    
    const prevWeekStart = new Date();
    prevWeekStart.setDate(prevWeekStart.getDate() - 14);
    
    const prevWeekCount = await db
      .$count(waitlist, sql`${waitlist.createdAt} >= ${prevWeekStart} AND ${waitlist.createdAt} < ${sevenDaysAgo}`);

    const weeklyGrowthRate = prevWeekCount > 0 
      ? ((lastWeekCount - prevWeekCount) / prevWeekCount) * 100 
      : lastWeekCount > 0 ? 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSignups: totalCount,
          lastWeekSignups: lastWeekCount,
          weeklyGrowthRate: Math.round(weeklyGrowthRate * 100) / 100,
        },
        signupsByDay,
        emailDomains,
        recentSignups: recentSignups.map(signup => ({
          email: signup.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for privacy
          createdAt: signup.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}