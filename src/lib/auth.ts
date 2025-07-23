import { db } from "@/db/drizzle";
import { account, session, user, verification } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
 
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
        schema: {
            user,
            account,
            session,
            verification
        }
    }),
    emailAndPassword: {  
        enabled: true
    },
    // socialProviders: { 
    //     github: { 
    //        clientId: process.env.GITHUB_CLIENT_ID as string, 
    //        clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    //     }, 
    // }, 
    trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        }
    },
    advanced: {
        defaultSignInRedirect: "/dashboard",
        defaultSignUpRedirect: "/dashboard",
        crossSubDomainCookies: {
            enabled: false
        }
    }
});