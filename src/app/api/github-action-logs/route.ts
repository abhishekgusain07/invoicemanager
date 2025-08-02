import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { GitHubActionsService } from "@/lib/services/github-actions-service";

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

    // Create log entry using service
    const result = await GitHubActionsService.createLog(body);

    return NextResponse.json(result);
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

    // Use service to get logs
    const result = await GitHubActionsService.getLogs(limit, actionName!);

    return NextResponse.json(result);
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

    // Update log entry using service
    const result = await GitHubActionsService.updateLog(body);

    return NextResponse.json(result);
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
