export const logDebug = (message: string, data?: any) => {
  console.log(`[INVOICE DEBUG] ${message}`, data || "");
};

/**
 * Server-side debug logging function
 * Use this for structured debug logging in server actions and API routes
 *
 * @param component - Server component or action name
 * @param message - Debug message
 * @param data - Optional data to log
 */
export const serverDebug = (component: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[SERVER:${component}][${timestamp}] ${message}`, data);
  } else {
    console.log(`[SERVER:${component}][${timestamp}] ${message}`);
  }
};
