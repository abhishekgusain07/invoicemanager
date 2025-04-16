import { authClient } from "@/lib/auth-client" // import the auth client
import { Session, User } from "better-auth"

export function useUser() {
    const { 
        data: userData, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession()

    return {
        user: userData?.user as User | undefined,
        session: userData?.session as Session | undefined,
        isLoading: isPending,
        error,
        refetch,
        isAuthenticated: !!userData?.user
    }
}
