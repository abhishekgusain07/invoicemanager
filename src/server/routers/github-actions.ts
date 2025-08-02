import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { GitHubActionsService } from "@/lib/services/github-actions-service";

const githubActionLogSchema = z.object({
  actionName: z.string().min(1),
  runId: z.string().min(1),
  workflowName: z.string().min(1),
  gitRef: z.string().min(1),
  environment: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  durationMs: z.number().int().optional(),
  status: z.enum(["running", "completed", "failed", "cancelled", "skipped"]),
  triggerEvent: z.string().min(1),
  actor: z.string().optional(),
  metadata: z.any().optional(),
  errorDetails: z.string().optional(),
});

const updateGithubActionLogSchema = z.object({
  runId: z.string().min(1),
  endTime: z.string().datetime().optional(),
  durationMs: z.number().int().optional(),
  status: z
    .enum(["running", "completed", "failed", "cancelled", "skipped"])
    .optional(),
  errorDetails: z.string().optional(),
  metadata: z.any().optional(),
});

export const githubActionsRouter = createTRPCRouter({
  create: publicProcedure
    .input(githubActionLogSchema)
    .mutation(async ({ input }) => {
      try {
        return await GitHubActionsService.createLog(input);
      } catch (error) {
        console.error("❌ Error logging GitHub Action via tRPC:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to log GitHub Action",
          cause: error,
        });
      }
    }),

  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        actionName: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await GitHubActionsService.getLogs(
          input.limit,
          input.actionName
        );
      } catch (error) {
        console.error(
          "❌ Error retrieving GitHub Action logs via tRPC:",
          error
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve GitHub Action logs",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(updateGithubActionLogSchema)
    .mutation(async ({ input }) => {
      try {
        return await GitHubActionsService.updateLog(input);
      } catch (error) {
        console.error("❌ Error updating GitHub Action log via tRPC:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update GitHub Action log",
          cause: error,
        });
      }
    }),

  getByRunId: publicProcedure
    .input(z.object({ runId: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        return await GitHubActionsService.getLogByRunId(input.runId);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "GitHub Action log not found"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "GitHub Action log not found",
          });
        }
        console.error(
          "❌ Error retrieving GitHub Action log by run ID via tRPC:",
          error
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve GitHub Action log",
          cause: error,
        });
      }
    }),
});
