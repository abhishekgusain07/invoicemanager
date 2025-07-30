import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { dashboardRouter } from './routers/dashboard';
import { invoiceRouter } from './routers/invoice';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  dashboard: dashboardRouter,
  invoice: invoiceRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;