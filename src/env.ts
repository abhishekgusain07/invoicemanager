// Environment variables made type-safe
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "",
  NEXT_PUBLIC_STRIPE_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  UPSTASH_ACCOUNT: process.env.UPSTASH_ACCOUNT || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
  NEXT_PUBLIC_WAITLIST_MODE: process.env.NEXT_PUBLIC_WAITLIST_MODE === "true",
};
