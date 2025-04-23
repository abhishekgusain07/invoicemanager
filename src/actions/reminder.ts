"use server";

import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { invoiceReminders, userSettings, clientInvoices, emailDeliveryStatusEnum } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";
import { serverDebug } from "@/utils/debug";

type ReminderParams = {
  invoiceId: string;
  emailSubject: string;
  emailContent: string;
  tone: "polite" | "friendly" | "neutral" | "firm" | "direct" | "assertive" | "urgent" | "final" | "serious";
};

/**
 * Send a reminder for an invoice and record it in the database
 */
export async function sendInvoiceReminder(params: ReminderParams) {
  const { invoiceId, emailSubject, emailContent, tone } = params;
  
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in to send reminders." };
  }
  
  try {
    // Check if invoice exists and belongs to user
    const invoice = await db
      .select()
      .from(clientInvoices)
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );
    
    if (invoice.length === 0) {
      return { success: false, error: "Invoice not found or you don't have permission." };
    }

    // Get the count of previous reminders for this invoice
    const previousReminders = await db
      .select()
      .from(invoiceReminders)
      .where(eq(invoiceReminders.invoiceId, invoiceId))
      .orderBy(desc(invoiceReminders.sentAt));
    
    const reminderNumber = previousReminders.length + 1;
    
    // In a real implementation, you would integrate with your email service here
    // For example: await sendEmail(invoice[0].clientEmail, emailSubject, emailContent);
    serverDebug("ReminderAction", `Sending reminder ${reminderNumber} for invoice ${invoiceId} with tone ${tone}`);
    
    // Record the reminder in the database
    await db.insert(invoiceReminders).values({
      id: uuidv4(),
      invoiceId,
      userId: session.user.id,
      reminderNumber,
      tone,
      emailSubject,
      emailContent,
      status: "sent", // This would be updated by webhook callbacks in a real email integration
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Revalidate related paths
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    
    return { 
      success: true, 
      reminderNumber,
      message: `Reminder ${reminderNumber} sent successfully.` 
    };
  } catch (error) {
    console.error("Error sending invoice reminder:", error);
    return { success: false, error: "Failed to send reminder." };
  }
}

/**
 * Get reminder history for an invoice
 */
export async function getInvoiceReminderHistory(invoiceId: string) {
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: [] };
  }
  
  try {
    // Check if invoice exists and belongs to user
    const invoice = await db
      .select()
      .from(clientInvoices)
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );
    
    if (invoice.length === 0) {
      return { success: false, error: "Invoice not found", data: [] };
    }
    
    // Get all reminders for this invoice
    const reminders = await db
      .select()
      .from(invoiceReminders)
      .where(eq(invoiceReminders.invoiceId, invoiceId))
      .orderBy(desc(invoiceReminders.sentAt));
    
    return { success: true, data: reminders };
  } catch (error) {
    console.error("Error fetching invoice reminder history:", error);
    return { success: false, error: "Failed to fetch reminder history", data: [] };
  }
}

/**
 * Get the last reminder sent for an invoice
 */
export async function getLastReminderSent(invoiceId: string) {
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    return null;
  }
  
  try {
    // Check if invoice exists and belongs to user
    const invoice = await db
      .select()
      .from(clientInvoices)
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );
    
    if (invoice.length === 0) {
      return null;
    }
    
    // Get the most recent reminder for this invoice
    const reminders = await db
      .select()
      .from(invoiceReminders)
      .where(eq(invoiceReminders.invoiceId, invoiceId))
      .orderBy(desc(invoiceReminders.sentAt))
      .limit(1);
    
    return reminders.length > 0 ? reminders[0] : null;
  } catch (error) {
    console.error("Error fetching last invoice reminder:", error);
    return null;
  }
}

/**
 * Update reminder status (for webhook callbacks)
 */
export async function updateReminderStatus(
  reminderId: string,
  status: "delivered" | "opened" | "clicked" | "replied" | "bounced"
) {
  try {
    const statusData: Record<string, any> = {
      status
    };
    
    // Add timestamp based on status
    if (status === "delivered") {
      statusData.deliveredAt = new Date();
    } else if (status === "opened") {
      statusData.openedAt = new Date();
    } else if (status === "clicked") {
      statusData.clickedAt = new Date();
    } else if (status === "replied") {
      statusData.responseReceived = true;
      statusData.responseReceivedAt = new Date();
    }
    
    await db
      .update(invoiceReminders)
      .set(statusData)
      .where(eq(invoiceReminders.id, reminderId));
    
    return { success: true };
  } catch (error) {
    console.error("Error updating reminder status:", error);
    return { success: false, error: "Failed to update reminder status" };
  }
} 