import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { headers } from 'next/headers';

// Create context for tRPC requests
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;

  // Get the session from the request
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    db,
    session,
    user: session?.user ?? null,
    req,
  };
};

// Create the tRPC instance
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Middleware for authenticated users
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.user },
      user: ctx.user,
      db: ctx.db,
    },
  });
});

// Protected procedure for authenticated users
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// Rate limiting middleware (optional, for sensitive operations)
const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  // You can implement rate limiting here if needed
  // For now, just pass through
  return next();
});

// Admin middleware (if you have admin users)
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  // You can add admin role checking here if needed
  // For now, just ensure user is authenticated
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.user },
      user: ctx.user,
      db: ctx.db,
    },
  });
});

export const adminProcedure = t.procedure
  .use(enforceUserIsAuthed)
  .use(enforceUserIsAdmin);

// Export type definitions
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;