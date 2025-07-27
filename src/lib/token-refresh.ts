// lib/token-refresh.ts
import { google } from "googleapis";
import { getOAuthClient } from "./google";

export async function refreshAccessToken(refreshToken: string) {
  try {
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token,
      expiresAt: new Date(Date.now() + (credentials.expiry_date as number)),
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}
