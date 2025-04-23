import { NextRequest, NextResponse } from "next/server";
import { processScheduledReminders } from "@/actions/scheduled-reminders";
import { headers } from "next/headers";

/**
 * API route to trigger the scheduled reminders process
 * This would normally be called by a cron job or scheduled task
 * For demo/testing purposes, we're allowing it to be called manually with the right secret
 */
export async function GET(request: NextRequest) {
  // In a production environment, you would want to secure this endpoint
  // with a secret key or other authentication mechanism
  const authHeader = headers().get("Authorization");
  const secretKey = process.env.CRON_SECRET;
  
  // If no secret key is set, only allow from localhost in development
  if (!secretKey) {
    const host = headers().get("host") || "";
    if (!host.includes("localhost") && process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  } 
  // If secret key is set, require it for auth
  else if (authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    // Process the reminders
    const result = await processScheduledReminders();
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error running scheduled reminders:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Error processing reminders",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 