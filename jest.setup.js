import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_NODE_ENV = 'test'

// Polyfills for Neon database
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock ES modules that cause issues
jest.mock('superjson', () => ({
  serialize: jest.fn((data) => JSON.stringify(data)),
  deserialize: jest.fn((data) => JSON.parse(data)),
  default: {
    serialize: jest.fn((data) => JSON.stringify(data)),
    deserialize: jest.fn((data) => JSON.parse(data)),
  }
}))

jest.mock('uncrypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid'),
  getRandomValues: jest.fn(),
}))

jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    handler: jest.fn(),
    api: {
      getSession: jest.fn(),
    }
  })),
  emailAndPassword: jest.fn(),
}))

// Mock tRPC
jest.mock('@trpc/server', () => ({
  initTRPC: {
    context: jest.fn(() => ({
      create: jest.fn(() => ({
        router: jest.fn(),
        procedure: jest.fn(() => ({
          input: jest.fn().mockReturnThis(),
          query: jest.fn().mockReturnThis(),
          mutation: jest.fn().mockReturnThis(),
        })),
      })),
    })),
  },
  TRPCError: class MockTRPCError extends Error {
    constructor(opts) {
      super(opts.message);
      this.code = opts.code;
    }
  },
}))

// Mock drizzle
jest.mock('@/db/drizzle', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  },
}))

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn().mockResolvedValue({
        user: { id: 'test-user' },
        session: { token: 'test-token' }
      }),
    }
  },
}))

// Mock email service
jest.mock('@/lib/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}))

// Mock Next.js cache and headers
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/actions/tokens/getRefreshTokens', () => ({
  getUserRefreshToken: jest.fn().mockResolvedValue('mock-token'),
}))

// Mock Next.js headers - critical for server actions
jest.mock('next/headers', () => ({
  headers: jest.fn(() => 
    Promise.resolve(new Headers({
      'user-agent': 'test-agent',
      'authorization': 'Bearer test-token'
    }))
  )
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})