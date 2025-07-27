// hooks/useSendEmail.ts
"use client";

import { useState } from "react";

interface SendEmailParams {
  to:
    | Array<{ email: string; name?: string }>
    | { email: string; name?: string };
  subject: string;
  body?: string;
  html?: string;
  cc?: Array<{ email: string; name?: string }>;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: "base64";
  }>;
}

export function useSendEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (params: SendEmailParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/gmail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          to: Array.isArray(params.to) ? params.to : [params.to],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendEmail, isLoading, error };
}
