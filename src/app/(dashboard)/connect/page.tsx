"use client";
import { useState, useEffect } from "react";
import { GmailConnect } from "@/components/GmailConnect";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CircleCheck, Mail, AlertCircle, Loader2, Clock } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";
import { toast } from "sonner";
import { checkGmailConnection } from "@/actions/gmail";
import type { GmailConnectionData } from "@/actions/gmail";
import { ConnectSkeleton } from "./components/ConnectSkeleton";
export default function ConnectPage() {
    const [user, setUser] = useState<User|null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionData, setConnectionData] = useState<GmailConnectionData | null>(null);
    const [checkingConnection, setCheckingConnection] = useState<boolean>(false);

    useEffect(() => {
        const loadUser = async() => {
            try {
                const {data: session, error} = await authClient.getSession();
                if (!session || !session.user) {
                    throw new Error("Unauthorized, sign in before connecting gmail account");
                }
                setUser(session.user);
            } catch(error) {
                console.log(error);
                toast.error("User is not authorized, sign in before connecting gmail account");
            } finally {
                setLoadingUser(false);
            }
        };
        loadUser();
    }, []);

    // Check if user has a Gmail connection using server action
    useEffect(() => {
        const fetchGmailConnection = async () => {
            if (!user) return;
            
            try {
                setCheckingConnection(true);
                const { isConnected: connected, connectionData: data } = 
                    await checkGmailConnection(user.id);
                
                setIsConnected(connected);
                setConnectionData(data);
            } catch (error) {
                console.error("Error checking Gmail connection:", error);
                toast.error("Failed to check Gmail connection status");
            } finally {
                setCheckingConnection(false);
            }
        };
        
        fetchGmailConnection();
    }, [user]);

    if(loadingUser || checkingConnection) {
        return (
           <>
            <ConnectSkeleton />
           </>
        );
    }

    if(!user) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4">
                    Please sign in before connecting your Gmail account
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto py-12 px-4">
            <div className="flex flex-col space-y-2 mb-8">
                <h2 className="text-2xl font-semibold tracking-tight">Account Connections</h2>
                <p className="text-muted-foreground">
                    Connect external accounts to enhance your InvoiceManager experience
                </p>
            </div>

            <Card className="overflow-hidden shadow-sm border-slate-200 mb-6">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2.5 rounded-lg">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-medium">Gmail Connection</CardTitle>
                                <CardDescription className="text-sm">
                                    Estimated setup time: 30 seconds
                                </CardDescription>
                            </div>
                        </div>
                        {isConnected ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                                <CircleCheck className="mr-1 h-4 w-4" />
                                Connected
                            </Badge>
                        ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                                <AlertCircle className="mr-1 h-4 w-4" />
                                Not Connected
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {isConnected ? (
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg space-y-3">
                            <div className="flex items-center">
                                <Mail className="h-5 w-5 mr-2 text-slate-500" />
                                <span className="font-medium">{connectionData?.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-2" />
                                Connected on {connectionData?.createdAt ? new Date(connectionData.createdAt).toLocaleDateString() : ''}
                            </div>
                            <p className="text-sm text-slate-600">
                                Your Gmail account is successfully connected. InvoiceManager can now send email reminders on your behalf.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <p className="text-slate-600">
                                Connect your Gmail account to enable InvoiceManager to send automatic invoice reminders on your behalf.
                            </p>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex items-start gap-4">
                                <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">Send automated reminders</h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Let InvoiceManager handle your invoice follow-ups automatically based on your preferences
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 flex justify-end">
                    {!isConnected && user && (
                        <GmailConnect 
                            userId={user.id} 
                            onSuccess={() => {
                                setIsConnected(true);
                                toast.success("Gmail connected successfully!");
                            }} 
                        />
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
