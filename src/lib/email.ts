import { serverDebug } from "@/utils/debug";

/**
 * Email sending interface
 */
export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send an email using the configured email provider
 */
export async function sendEmail(params: EmailParams): Promise<{success: boolean, error?: string}> {
  try {
    // Log that we're sending an email in development
    serverDebug("Email", `Sending email to ${params.to} with subject "${params.subject}"`);
    
    // In a production app, you would connect to an email service like SendGrid, Mailgun, etc.
    // For now, we'll just log the email and pretend it was sent
    
    // Example with Resend:
    // const data = await resend.emails.send({
    //   from: params.from || "Invoice Manager <invoices@yourdomain.com>",
    //   to: params.to,
    //   subject: params.subject,
    //   html: params.html,
    //   text: params.text
    // });
    
    console.log("Email would be sent:", {
      to: params.to,
      subject: params.subject,
      bodyPreview: params.html.substring(0, 100) + "..."
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 