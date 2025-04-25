"use server"
import { db } from "@/db/drizzle";
import { invoiceReminders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { serverDebug } from "@/utils/debug";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq, desc } from "drizzle-orm";


export async function logInvoiceReminder({
  invoiceId,
  emailContent,
  emailSubject,
  reminderType,
}: {
  invoiceId: string;
  emailContent: string;
  emailSubject: string;
  reminderType: string;
}) {
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in to create an invoice." };
  }


  try {

    
    // Insert the reminder record
    await db.insert(invoiceReminders).values({
      id: uuidv4(),
      userId: session.user.id as string,
      invoiceId,
      emailContent,
      emailSubject,
      reminderNumber: 1, // Assuming this is the first reminder if not specified
      tone: reminderType as any, // Cast the string to the enum type
      status: "sent", // Default email delivery status
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Revalidate the invoice page path to reflect the change
    revalidatePath("/invoices");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    serverDebug("Error logging invoice reminder:","");
    return {
      error: "Failed to log invoice reminder",
      success: false,
    };
  }
}

/**
 * Get reminder history for an invoice
 */
export async function getInvoiceReminderHistory(invoiceId: string) {
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please login first" };
  }

  try {
    const reminderHistory = await db
      .select()
      .from(invoiceReminders)
      .where(and(
        eq(invoiceReminders.invoiceId, invoiceId), 
        eq(invoiceReminders.userId, session.user.id as string)
      ))
      .orderBy(desc(invoiceReminders.createdAt));

    return reminderHistory;
  } catch (error) {
    serverDebug("Error fetching invoice reminder history:","");
    return [];
  }
}

/**
 * Get the last reminder for an invoice
 */
export async function getLastInvoiceReminder(invoiceId: string) {
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please login first" };
  }

  try {
    const lastReminder = await db
      .select()
      .from(invoiceReminders)
      .where(and(
        eq(invoiceReminders.invoiceId, invoiceId),
        eq(invoiceReminders.userId, session.user.id as string)
      ))
      .orderBy(desc(invoiceReminders.createdAt))
      .limit(1)
      .then(results => results[0] || null);

    return lastReminder;
  } catch (error) {
    serverDebug("Error fetching last invoice reminder:", "");
    return null;
  }
} 