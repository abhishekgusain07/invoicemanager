import { db } from "@/db/drizzle";
import { githubActionLogs, type GithubActionLogInsert } from "@/db/schema";
import { desc, eq, lt, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface CreateGithubActionLogInput {
  actionName: string;
  runId: string;
  workflowName: string;
  gitRef: string;
  environment: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  status: "running" | "completed" | "failed" | "cancelled" | "skipped";
  triggerEvent: string;
  actor?: string;
  metadata?: any;
  errorDetails?: string;
}

export interface UpdateGithubActionLogInput {
  runId: string;
  endTime?: string;
  durationMs?: number;
  status?: "running" | "completed" | "failed" | "cancelled" | "skipped";
  errorDetails?: string;
  metadata?: any;
}

export class GitHubActionsService {
  static async createLog(input: CreateGithubActionLogInput) {
    const logEntry: GithubActionLogInsert = {
      id: uuidv4(),
      actionName: input.actionName,
      runId: input.runId,
      workflowName: input.workflowName,
      gitRef: input.gitRef,
      environment: input.environment,
      startTime: new Date(input.startTime),
      endTime: input.endTime ? new Date(input.endTime) : null,
      durationMs: input.durationMs || null,
      status: input.status,
      triggerEvent: input.triggerEvent,
      actor: input.actor || null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      errorDetails: input.errorDetails || null,
    };

    await db.insert(githubActionLogs).values(logEntry);

    console.log("✅ GitHub Action log recorded", {
      actionName: logEntry.actionName,
      runId: logEntry.runId,
      status: logEntry.status,
      environment: logEntry.environment,
    });

    return {
      success: true,
      id: logEntry.id,
      message: "GitHub Action log recorded successfully",
    };
  }

  static async updateLog(input: UpdateGithubActionLogInput) {
    const updateData: Partial<GithubActionLogInsert> = {};

    if (input.endTime) updateData.endTime = new Date(input.endTime);
    if (input.durationMs) updateData.durationMs = input.durationMs;
    if (input.status) updateData.status = input.status;
    if (input.errorDetails) updateData.errorDetails = input.errorDetails;
    if (input.metadata) updateData.metadata = JSON.stringify(input.metadata);

    updateData.updatedAt = new Date();

    await db
      .update(githubActionLogs)
      .set(updateData)
      .where(eq(githubActionLogs.runId, input.runId));

    console.log("✅ GitHub Action log updated", {
      runId: input.runId,
      status: input.status,
    });

    return {
      success: true,
      message: "GitHub Action log updated successfully",
    };
  }

  static async getLogs(limit: number = 50, actionName?: string) {
    // Build query conditionally without reassigning
    const baseQuery = db.select().from(githubActionLogs);

    const logs = actionName
      ? await baseQuery
          .where(eq(githubActionLogs.actionName, actionName))
          .orderBy(desc(githubActionLogs.createdAt))
          .limit(Math.min(limit, 100))
      : await baseQuery
          .orderBy(desc(githubActionLogs.createdAt))
          .limit(Math.min(limit, 100));

    const parsedLogs = logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));

    return {
      success: true,
      logs: parsedLogs,
      count: parsedLogs.length,
    };
  }

  static async getLogByRunId(runId: string) {
    const log = await db
      .select()
      .from(githubActionLogs)
      .where(eq(githubActionLogs.runId, runId))
      .limit(1);

    if (log.length === 0) {
      throw new Error("GitHub Action log not found");
    }

    const parsedLog = {
      ...log[0],
      metadata: log[0].metadata ? JSON.parse(log[0].metadata) : null,
    };

    return {
      success: true,
      log: parsedLog,
    };
  }

  static async cleanupOldLogs(daysOld: number = 1, dryRun: boolean = false) {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(
      `🧹 Cleaning up GitHub Action logs older than ${daysOld} days (before ${cutoffDate.toISOString()})`
    );

    if (dryRun) {
      // In dry run mode, just count what would be deleted
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(githubActionLogs)
        .where(lt(githubActionLogs.createdAt, cutoffDate));

      const count = countResult[0]?.count || 0;

      console.log(
        `🧪 DRY RUN: Would delete ${count} GitHub Action log entries`
      );

      return {
        success: true,
        dryRun: true,
        deletedCount: 0,
        wouldDeleteCount: count,
        cutoffDate: cutoffDate.toISOString(),
        message: `Dry run: ${count} logs would be deleted`,
      };
    }

    // Actually delete the old logs
    const deleteResult = await db
      .delete(githubActionLogs)
      .where(lt(githubActionLogs.createdAt, cutoffDate));

    const deletedCount = deleteResult.rowCount || 0;

    console.log(`✅ Deleted ${deletedCount} old GitHub Action log entries`);

    return {
      success: true,
      dryRun: false,
      deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      message: `Successfully deleted ${deletedCount} old log entries`,
    };
  }

  static async getLogStats() {
    // Get total count and oldest/newest entries
    const stats = await db
      .select({
        totalCount: sql<number>`count(*)`,
        oldestEntry: sql<string>`min(created_at)`,
        newestEntry: sql<string>`max(created_at)`,
      })
      .from(githubActionLogs);

    // Get counts by action name
    const actionCounts = await db
      .select({
        actionName: githubActionLogs.actionName,
        count: sql<number>`count(*)`,
      })
      .from(githubActionLogs)
      .groupBy(githubActionLogs.actionName)
      .orderBy(desc(sql<number>`count(*)`));

    return {
      success: true,
      stats: stats[0],
      actionCounts,
    };
  }
}
