import { createAuthClient } from "better-auth/react"

// Determine if we're in production or development
const isProd = process.env.NODE_ENV === 'production';

export const authClient = createAuthClient({
    /** the base url of the server */
    baseURL: isProd 
        ? typeof window !== 'undefined' ? window.location.origin : '' // In production, use current origin
        : 'http://localhost:3000' // In development, use localhost
})

export const { signIn, signUp, useSession } = createAuthClient()