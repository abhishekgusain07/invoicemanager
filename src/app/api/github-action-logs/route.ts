import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { githubActionLogs, type GithubActionLogInsert } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * API route for GitHub Action logging
 * Used by workflows to log their execution status and timing
 */

// POST - Log a GitHub Action run
export async function POST(request: NextRequest) {
  try {
    // Security check - require CRON_SECRET for authentication
    const authHeader = headers().get("Authorization");
    const secretKey = process.env.CRON_SECRET;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "actionName",
      "runId",
      "workflowName",
      "gitRef",
      "environment",
      "startTime",
      "status",
      "triggerEvent",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create log entry
    const logEntry: GithubActionLogInsert = {
      id: uuidv4(),
      actionName: body.actionName,
      runId: body.runId,
      workflowName: body.workflowName,
      gitRef: body.gitRef,
      environment: body.environment,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : null,
      durationMs: body.durationMs || null,
      status: body.status,
      triggerEvent: body.triggerEvent,
      actor: body.actor || null,
      metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      errorDetails: body.errorDetails || null,
    };

    // Insert into database
    const result = await db.insert(githubActionLogs).values(logEntry);

    console.log("✅ GitHub Action log recorded", {
      actionName: logEntry.actionName,
      runId: logEntry.runId,
      status: logEntry.status,
      environment: logEntry.environment,
    });

    return NextResponse.json({
      success: true,
      id: logEntry.id,
      message: "GitHub Action log recorded successfully",
    });
  } catch (error) {
    console.error("❌ Error logging GitHub Action:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to log GitHub Action",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve GitHub Action logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const actionName = searchParams.get("actionName");

    // Build query
    let query = db.select().from(githubActionLogs);

    // Filter by action name if provided
    if (actionName) {
      query = query.where(eq(githubActionLogs.actionName, actionName));
    }

    // Order by creation date and limit results
    const logs = await query
      .orderBy(desc(githubActionLogs.createdAt))
      .limit(Math.min(limit, 100)); // Cap at 100 records

    // Parse metadata for each log
    const parsedLogs = logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      logs: parsedLogs,
      count: parsedLogs.length,
    });
  } catch (error) {
    console.error("❌ Error retrieving GitHub Action logs:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve GitHub Action logs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PUT - Update a GitHub Action log (for completion status)
export async function PUT(request: NextRequest) {
  try {
    // Security check
    const authHeader = headers().get("Authorization");
    const secretKey = process.env.CRON_SECRET;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.runId) {
      return NextResponse.json(
        { error: "Missing required field: runId" },
        { status: 400 }
      );
    }

    // Update log entry
    const updateData: Partial<GithubActionLogInsert> = {};

    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.durationMs) updateData.durationMs = body.durationMs;
    if (body.status) updateData.status = body.status;
    if (body.errorDetails) updateData.errorDetails = body.errorDetails;
    if (body.metadata) updateData.metadata = JSON.stringify(body.metadata);

    updateData.updatedAt = new Date();

    // Update in database
    const result = await db
      .update(githubActionLogs)
      .set(updateData)
      .where(eq(githubActionLogs.runId, body.runId));

    console.log("✅ GitHub Action log updated", {
      runId: body.runId,
      status: body.status,
    });

    return NextResponse.json({
      success: true,
      message: "GitHub Action log updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating GitHub Action log:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update GitHub Action log",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
