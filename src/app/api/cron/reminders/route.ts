import { NextRequest, NextResponse } from "next/server";
import { processScheduledReminders } from "@/actions/scheduled-reminders";
import { headers } from "next/headers";

/**
 * API route to trigger the scheduled reminders process
 * This endpoint is secured with bearer token authentication for production use
 * Called by GitHub Actions workflow on a scheduled basis
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Enhanced security validation
    const authHeader = headers().get("Authorization");
    const secretKey = process.env.CRON_SECRET;
    const host = headers().get("host") || "";
    const userAgent = headers().get("user-agent") || "";

    // Validate secret key configuration
    if (!secretKey || secretKey.trim() === "") {
      // In development, allow localhost access only
      if (process.env.NODE_ENV === "development" && host.includes("localhost")) {
        console.warn("⚠️  CRON_SECRET not set - allowing localhost access in development");
      } else {
        console.error("🚫 CRON_SECRET not configured properly");
        return NextResponse.json(
          { 
            error: "Unauthorized", 
            message: "Authentication required",
            timestamp: new Date().toISOString()
          }, 
          { status: 401 }
        );
      }
    } else {
      // Validate Authorization header format and token
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("🚫 Invalid or missing Authorization header format");
        return NextResponse.json(
          { 
            error: "Unauthorized", 
            message: "Invalid authorization format",
            timestamp: new Date().toISOString()
          }, 
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix
      
      // Validate token length and content
      if (token.length < 16) {
        console.error("🚫 Authorization token too short");
        return NextResponse.json(
          { 
            error: "Unauthorized", 
            message: "Invalid token format",
            timestamp: new Date().toISOString()
          }, 
          { status: 401 }
        );
      }

      // Secure token comparison
      if (token !== secretKey) {
        console.error("🚫 Invalid authorization token provided");
        return NextResponse.json(
          { 
            error: "Unauthorized", 
            message: "Invalid credentials",
            timestamp: new Date().toISOString()
          }, 
          { status: 401 }
        );
      }
    }

    // Log request details for monitoring
    console.log("✅ Authorized cron request received", {
      timestamp: new Date().toISOString(),
      host,
      userAgent,
      hasSecret: !!secretKey,
      environment: process.env.NODE_ENV,
    });

    // Process the reminders with timing
    console.log("🚀 Starting scheduled reminders processing...");
    const result = await processScheduledReminders();
    
    const executionTime = Date.now() - startTime;
    
    // Enhanced response logging
    console.log("✅ Scheduled reminders processing completed", {
      ...result,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString(),
    });

    // Return enhanced result with metadata
    return NextResponse.json({
      ...result,
      metadata: {
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      }
    });
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error("❌ Error running scheduled reminders:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error processing reminders",
        details: error instanceof Error ? error.message : String(error),
        metadata: {
          executionTimeMs: executionTime,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        }
      },
      { status: 500 }
    );
  }
  } catch (authError) {
    // Handle authentication errors separately
    console.error("❌ Authentication error:", authError);
    return NextResponse.json(
      { 
        error: "Authentication failed", 
        timestamp: new Date().toISOString() 
      }, 
      { status: 401 }
    );
  }
}
