// lib/email-service.ts
import { google } from 'googleapis';
import { createMimeMessage } from 'mimetext';
import { getOAuthClient } from './google';

interface SendEmailParams {
  refreshToken: string;
  to: Array<{ email: string; name?: string }>;
  subject: string;
  text: string;
  html?: string;
  from?: { email: string; name?: string };
  cc?: Array<{ email: string; name?: string }>;
  attachments?: Array<{ filename: string; content: string; encoding: 'base64' }>;
}

export async function sendEmail({
  refreshToken,
  to,
  subject,
  text,
  html,
  from,
  cc,
  attachments
}: SendEmailParams) {
  try {
    // Setup auth
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    // Create Gmail client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Get user profile to get email address if from is not provided
    if (!from) {
      const profile = await gmail.users.getProfile({ userId: 'me' });
      from = { email: profile.data.emailAddress || '' };
    }
    
    // Create MIME message
    const msg = createMimeMessage();
    
    // Set sender
    msg.setSender({ addr: from.email, name: from.name || '' });
    
    // Set recipients
    msg.setRecipients(to.map(recipient => ({ 
      addr: recipient.email, 
      name: recipient.name || '' 
    })));
    
    // Set CC if provided
    if (cc && cc.length > 0) {
      msg.setCc(cc.map(recipient => ({ 
        addr: recipient.email, 
        name: recipient.name || '' 
      })));
    }
    
    // Set subject
    msg.setSubject(subject);
    
    // Set content
    if (html) {
      msg.addMessage({ contentType: 'text/html', data: html });
    } else {
      msg.addMessage({ contentType: 'text/plain', data: text });
    }
    // Add attachments if any
    if (attachments && attachments.length > 0) {
      attachments.forEach(attachment => {
        msg.addAttachment({
          filename: attachment.filename,
          data: attachment.content,
          contentType: getMimeType(attachment.filename),
        });
      });
    }
    
    // Send email
    const raw = msg.asEncoded();
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
    
    return {
      success: true,
      messageId: result.data.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper to determine MIME type from filename
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
  };
  
  return ext && ext in mimeTypes ? mimeTypes[ext] : 'application/octet-stream';
}