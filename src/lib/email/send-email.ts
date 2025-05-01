import { useSendEmail } from "@/hooks/sendEmail";
import { serverDebug } from "@/utils/debug";

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
 * Sends an email using the configured email service
 * Can be expanded to use Gmail API, SendGrid, or any other email service
 */
export async function sendEmail(params: EmailParams) {
  const { to, subject, html, text } = params;
  
  const { sendEmail: sendEmailThroughGmail, isLoading, error } = useSendEmail();
  try {
    // Log the email for debugging
    serverDebug("Sending email", JSON.stringify({
      to: `${to.name} <${to.email}>`,
      subject,
      contentLength: html.length
    }));
    
    //TODO: priority
    // For now, just log success - this will be replaced with actual email sending code
    // Depending on your implementation, you might use:
    // - Gmail API for accounts connected via OAuth
    // - SendGrid, Mailgun, or other transactional email services
    // - SMTP directly
    
    // await sendEmailThroughGmail({
    //   to: { email: "valorantgusain@gmail.com", name: "Gusain" },
    //   subject: `Reminder: Invoice __ Payment Due`,
    //   html: `
    //     <div>
    //       <h2>Invoice Payment Reminder</h2>
    //       <p>Dear __,</p>
    //       <p>This is a friendly reminder that payment for invoice #__ in the amount of $__ was due on __.</p>
    //       <p>Please make your payment at your earliest convenience.</p>
    //       <p>Thank you for your business!</p>
    //     </div>
    //   `,
    // });

    return {
      success: true,
      messageId: `mock-${Date.now()}`
      
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error}`);
  }
} 