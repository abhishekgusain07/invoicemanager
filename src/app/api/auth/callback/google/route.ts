// app/api/auth/callback/google/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getTokens } from '@/lib/google';
import { db } from '@/db/drizzle';
import { gmailConnection } from '@/db/schema';
import { v4 as uuidv4 } from "uuid";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  console.log('========= GOOGLE AUTH CALLBACK START =========');
  console.log('Request URL:', req.url);
  console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));
  
  try {
    const session = await auth.api.getSession({
      headers:  await headers()
    });
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }
  
    // Get code and state from URL
    const searchParams = req.nextUrl.searchParams;
    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    
    const code = searchParams.get('code');
    const userId = session.user.id;
    
    console.log('Auth code received:', code ? 'Yes (length: ' + code.length + ')' : 'No');
    console.log('User ID from better auth session :', userId);

    if (!code) {
      console.error('ERROR: No code provided in callback');
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    let tokens;
    try {
      tokens = await getTokens(code);
      console.log('Tokens received:', {
        access_token: tokens.access_token ? 'Yes (length: ' + tokens.access_token.toString().length + ')' : 'No',
        refresh_token: tokens.refresh_token ? 'Yes' : 'No',
        expiry_date: tokens.expiry_date || 'Not provided',
        token_type: tokens.token_type || 'Not provided',
      });
    } catch (tokenError) {
      console.error('TOKEN EXCHANGE ERROR:', tokenError);
      throw tokenError;
    }
    
    // Get user info
    console.log('Setting up OAuth client for user info request...');
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    
    console.log('Fetching user info from People API...');
    let userInfo;
    try {
      const people = google.people({ version: 'v1', auth: oauth2Client });
      userInfo = await people.people.get({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses',
      });
      console.log('User info received:', JSON.stringify(userInfo.data, null, 2));
    } catch (userInfoError) {
      console.error('USER INFO ERROR:', userInfoError);
      throw userInfoError;
    }

    const email = userInfo.data.emailAddresses?.[0]?.value;
    const name = userInfo.data.names?.[0]?.displayName;
    
    console.log('Extracted user data:', { email, name });

    // Store tokens in your database
    console.log('Storing tokens in database...');
    try {
      const result = await storeUserTokens({
        userId: userId as string,
        email: email as string,
        name: name as string,
        accessToken: tokens.access_token as string,
        refreshToken: tokens.refresh_token as string,
        expiresAt: new Date(Date.now() + (tokens.expiry_date as number)),
      });
      
      console.log('Database operation result:', result);
    } catch (dbError) {
      console.error('DATABASE ERROR:', dbError);
      throw dbError;
    }

    console.log('Authentication successful, redirecting to dashboard...');
    console.log('========= GOOGLE AUTH CALLBACK END =========');
    
    // Redirect back to your app
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error: any) {
    console.error('========= AUTH CALLBACK ERROR =========');
    console.error('Error type:', error?.constructor?.name || 'Unknown');
    console.error('Error message:', error?.message || 'No message');
    console.error('Error stack:', error?.stack || 'No stack trace');
    
    try {
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (jsonError) {
      console.error('Error converting error to JSON:', jsonError);
      console.error('Raw error object:', error);
    }
    
    console.error('========= AUTH CALLBACK ERROR END =========');
    
    const errorMessage = encodeURIComponent(error?.message || 'Unknown error');
    return NextResponse.redirect(new URL(`/error?message=Authentication+failed&detail=${errorMessage}`, req.url));
  }
}

// Example function to store tokens - replace with your actual database logic
async function storeUserTokens(data: {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}) {
  console.log('storeUserTokens called with:', {
    userId: data.userId,
    email: data.email,
    name: data.name,
    accessToken: data.accessToken ? 'Yes (length: ' + data.accessToken.length + ')' : 'No',
    refreshToken: data.refreshToken ? 'Yes' : 'No',
    expiresAt: data.expiresAt.toISOString(),
  });
  
  try {
    console.log('Preparing database insert/update operation...');
    console.log('Target table:', 'gmailConnection');
    console.log('Current time:', new Date().toISOString());

    const result = await db
      .insert(gmailConnection)
      .values({
        id: uuidv4(),
        userId: data.userId,
        email: data.email,
        name: data.name || null,
        picture: null, // Add picture if available in your data
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        scope: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        providerId: 'google',
        expiresAt: data.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [gmailConnection.userId, gmailConnection.email],
        set: {
          name: data.name || null,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
          updatedAt: new Date(),
        },
      });

    console.log('Database operation completed successfully');
    console.log('Result:', result);
    
    return { success: true };
  } catch (error: any) {
    console.error('========= DATABASE ERROR DETAILS =========');
    console.error('Error type:', error?.constructor?.name || 'Unknown');
    console.error('Error message:', error?.message || 'No message');
    console.error('Error stack:', error?.stack || 'No stack trace');
    console.error('========= DATABASE ERROR DETAILS END =========');
    
    return { success: false, error };
  }
}