import { serverDebug } from "@/utils/debug";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type EmailRecipient = {
  email: string;
  name: string;
};

type EmailParams = {
  to: EmailRecipient;
  subject: string;
  html: string;
  text?: string; // Optional plain text version
};

/**
 * Sends an email using the Gmail API through the /api/gmail/send endpoint
 */
export async function sendEmail(params: EmailParams) {
  const { to, subject, html, text } = params;

  try {
    // Get the current session to get the base URL
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    // Log the email for debugging
    serverDebug(
      "Sending email",
      JSON.stringify({
        to: `${to.name} <${to.email}>`,
        subject,
        contentLength: html.length,
      })
    );

    // Get the base URL from the headers
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    // Call the Gmail API endpoint
    const response = await fetch(`${baseUrl}/api/gmail/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: session.user.id,
        to: [{ email: "valorantgusain@gmail.com", name: to.name }],
        subject,
        html,
        body: text, // Plain text fallback
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    serverDebug(
      "Email sent successfully",
      JSON.stringify({
        messageId: result.messageId,
        to: `${to.name} <${to.email}>`,
        subject,
      })
    );

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
