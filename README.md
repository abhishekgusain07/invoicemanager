This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Analytics and Monitoring Configuration

This template includes built-in support for analytics and error monitoring through PostHog and Sentry. Both services are optional and can be enabled or disabled through environment variables and configuration.

### Configuration Options

All analytics and monitoring features can be controlled in the `src/config.ts` file:

```typescript
const config = {
  auth: {
    enabled: true,
  },
  payments: {
    enabled: true,
  },
  analytics: {
    posthog: {
      enabled: process.env.NEXT_PUBLIC_POSTHOG_KEY ? true : false,
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    },
  },
  monitoring: {
    sentry: {
      enabled: process.env.NEXT_PUBLIC_SENTRY_DSN ? true : false,
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    },
  },
};
```

### PostHog Analytics

PostHog provides product analytics, session recording, feature flags, and more.

To enable PostHog:
1. Create a PostHog account and project at [PostHog.com](https://posthog.com)
2. Add your API key to the `.env` file: `NEXT_PUBLIC_POSTHOG_KEY=phc_your_api_key`
3. Optionally set a custom host with `NEXT_PUBLIC_POSTHOG_HOST`

To disable PostHog:
- Simply leave the `NEXT_PUBLIC_POSTHOG_KEY` empty in your `.env` file

### Sentry Error Monitoring

Sentry provides error tracking, performance monitoring, and more.

To enable Sentry:
1. Create a Sentry account and project at [Sentry.io](https://sentry.io)
2. Add your DSN to the `.env` file: `NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-url`
3. For source map uploads, add: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`

To disable Sentry:
- Simply leave the `NEXT_PUBLIC_SENTRY_DSN` empty in your `.env` file

### Testing Error Monitoring

To test Sentry integration, visit the `/sentry-example-page` route in your application, which includes buttons to trigger test errors.
