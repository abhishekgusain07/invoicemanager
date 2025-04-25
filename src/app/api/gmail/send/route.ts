// app/api/gmail/send/route.ts
import { getUserRefreshToken } from '@/actions/tokens/getRefreshTokens';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email-service';
import { headers } from 'next/headers';
// Implement this based on your DB
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, to, subject, body, html, cc, attachments } = await req.json();
    const session = await auth.api.getSession({
      headers:  await headers()
    });
    if (!session?.user) {
      return { success: false, data: null, error: "Unauthorized" };
    }
  
    const currentUserId = session.user.id;
    if (!currentUserId || !to || !subject || !(body || html)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get refresh token from database
    const refreshToken = await getUserRefreshToken(currentUserId);
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Gmail account not connected' },
        { status: 401 }
      );
    }
    
    // Send email
    const result = await sendEmail({
      refreshToken,
      to: Array.isArray(to) ? to : [to],
      subject,
      text: body || '',
      html,
      cc,
      attachments,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}