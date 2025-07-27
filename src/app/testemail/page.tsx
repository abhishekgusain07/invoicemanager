"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MailIcon,
  SendIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  LoaderIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !firstname) {
      toast.error("Please provide both email and first name");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstname,
        }),
      });

      const data = await response.json();
      setApiResponse(data);

      if (response.ok) {
        setStatus("success");
        toast.success("Test email sent successfully!");
      } else {
        setStatus("error");
        toast.error(
          `Failed to send email: ${data.error || data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      setStatus("error");
      setApiResponse({ error: "Failed to connect to the API" });
      toast.error("Failed to connect to the email API");
    }
  };

  const resetForm = () => {
    setEmail("");
    setFirstname("");
    setStatus("idle");
    setApiResponse(null);
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="bg-primary/15 p-2 rounded-full">
              <MailIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Test Email Sender</CardTitle>
          </div>
          <CardDescription>
            Send a test email to verify your email configuration
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                placeholder="John"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                disabled={status === "loading"}
                required
              />
            </div>

            {apiResponse && (
              <div
                className={`mt-4 p-4 rounded-md text-sm overflow-auto max-h-36 ${
                  status === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          {status === "success" || status === "error" ? (
            <Button variant="outline" onClick={resetForm} className="w-full">
              Reset
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="w-full gap-2"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          )}
        </CardFooter>

        {status === "success" && (
          <div className="px-6 pb-6 pt-1 flex items-center gap-2 text-green-600">
            <CheckCircleIcon className="h-5 w-5" />
            <span>Email sent successfully!</span>
          </div>
        )}

        {status === "error" && (
          <div className="px-6 pb-6 pt-1 flex items-center gap-2 text-red-600">
            <AlertCircleIcon className="h-5 w-5" />
            <span>Failed to send email. Check console for details.</span>
          </div>
        )}
      </Card>
    </div>
  );
}
