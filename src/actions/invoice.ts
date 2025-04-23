"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { clientInvoices, invoiceStatusEnum } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import { v4 as uuidv4 } from "uuid";
import { invoiceFormSchema } from "@/lib/validations/invoice";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createInvoice(formData: FormData) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in to create an invoice." };
  }

  try {
    // Extract and validate form data with Zod
    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse and validate with Zod
    const validationResult = invoiceFormSchema.safeParse(rawFormData);
    
    if (!validationResult.success) {
      // Return validation errors
      return { 
        success: false, 
        error: "Invalid form data", 
        errors: validationResult.error.flatten().fieldErrors 
      };
    }
    
    const validData = validationResult.data;
    
    // Parse dates from strings
    const issueDate = new Date(validData.issueDate);
    const dueDate = new Date(validData.dueDate);

    // Insert new invoice - convert amount to string to satisfy Drizzle's type requirements
    await db.insert(clientInvoices).values({
      id: uuidv4(),
      userId: session.user.id,
      clientName: validData.clientName,
      clientEmail: validData.clientEmail,
      invoiceNumber: validData.invoiceNumber,
      amount: String(validData.amount), // Convert to string for Drizzle
      currency: validData.currency,
      issueDate,
      dueDate,
      description: validData.description || "",
      additionalNotes: validData.additionalNotes || "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Revalidate dashboard to show new invoice
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function getInvoiceStats() {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers:  await headers()
  });

  if (!session?.user) {
    return {
      pendingInvoices: 0,
      overdueInvoices: 0,
      paidInvoices: 0,
      outstandingAmount: "$0.00",
      recentInvoices: []
    };
  }

  try {
    // Fetch all user invoices using typed query
    const userInvoices = await db
    .select()
    .from(clientInvoices)
    .where(eq(clientInvoices.userId, session.user.id));

    // Count invoices by status
    const pendingInvoices = userInvoices.filter(invoice => invoice.status === "pending").length;
    const paidInvoices = userInvoices.filter(invoice => invoice.status === "paid").length;
    
    // Calculate overdue invoices (due date has passed and not paid)
    const now = new Date();
    const overdueInvoices = userInvoices.filter(
      invoice => invoice.status === "pending" && invoice.dueDate < now
    ).length;
    
    // Calculate total outstanding amount (all unpaid invoices)
    const outstandingTotal = userInvoices
      .filter(invoice => invoice.status !== "paid")
      .reduce((sum, invoice) => sum + parseFloat(invoice.amount as string), 0);
    
    // Format with currency symbol, assuming USD for now
    const outstandingAmount = `$${outstandingTotal.toFixed(2)}`;
    
    // Get most recent 5 invoices
    const recentInvoices = [...userInvoices]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
    
    return {
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      outstandingAmount,
      recentInvoices
    };
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    return {
      pendingInvoices: 0,
      overdueInvoices: 0,
      paidInvoices: 0,
      outstandingAmount: "$0.00",
      recentInvoices: []
    };
  }
}

export async function getInvoicesByStatus(status: "pending" | "paid" | "overdue" | "all") {
  console.log(`[SERVER ACTION] getInvoicesByStatus called with status=${status}`);
  
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    console.log(`[SERVER ACTION] getInvoicesByStatus: No authenticated user`);
    return [];
  }
  
  console.log(`[SERVER ACTION] getInvoicesByStatus: User authenticated: ${session.user.id}`);

  try {
    // Fetch all user invoices
    console.log(`[SERVER ACTION] Fetching invoices for user ${session.user.id}`);
    const userInvoices = await db
    .select()
    .from(clientInvoices)
    .where(eq(clientInvoices.userId, session.user.id));
    
    console.log(`[SERVER ACTION] Found ${userInvoices.length} total invoices for user`);
    // Log each invoice ID and status to track issues
    userInvoices.forEach(invoice => {
      console.log(`[SERVER ACTION] Invoice ${invoice.id}: status=${invoice.status}, client=${invoice.clientName}`);
    });

    const now = new Date();
    let filteredInvoices;
    
    if (status === "all") {
      filteredInvoices = userInvoices;
      console.log(`[SERVER ACTION] Returning all ${filteredInvoices.length} invoices`);
    } else if (status === "overdue") {
      filteredInvoices = userInvoices.filter(
        invoice => invoice.status === "pending" && invoice.dueDate < now
      );
      console.log(`[SERVER ACTION] Returning ${filteredInvoices.length} overdue invoices`);
    } else {
      filteredInvoices = userInvoices.filter(invoice => invoice.status === status);
      console.log(`[SERVER ACTION] Returning ${filteredInvoices.length} ${status} invoices`);
    }
    
    // Log final output
    filteredInvoices.forEach(invoice => {
      console.log(`[SERVER ACTION] Returning invoice ${invoice.id}: status=${invoice.status}, client=${invoice.clientName}`);
    });
    
    return filteredInvoices;
  } catch (error) {
    console.error(`[SERVER ACTION] Error fetching ${status} invoices:`, error);
    return [];
  }
}

export async function getMonthlyInvoiceData() {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return [];
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  try {
    // Fetch all user invoices
    const userInvoices = await db
    .select()
    .from(clientInvoices)
    .where(eq(clientInvoices.userId, session.user.id));

    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Create monthly data for the current year
    const monthlyData = months.map((month, index) => {
      // Get all invoices created in this month of the current year
      const monthInvoices = userInvoices.filter(invoice => {
        const issueDate = invoice.issueDate;
        return issueDate.getMonth() === index && issueDate.getFullYear() === currentYear;
      });
      
      // Calculate total amount
      const amount = monthInvoices.reduce((sum, invoice) => 
        sum + parseFloat(invoice.amount as string), 0);
      
      return {
        name: month,
        amount
      };
    });
    
    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly invoice data:", error);
    return months.map(month => ({ name: month, amount: 0 }));
  }
}

export async function deleteInvoice(invoiceId: string) {
  console.log(`[SERVER ACTION] deleteInvoice called for invoiceId=${invoiceId}`);
  
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    console.log(`[SERVER ACTION] deleteInvoice: Authentication failed - no user session`);
    return { success: false, error: "Unauthorized. Please sign in to delete an invoice." };
  }
  
  console.log(`[SERVER ACTION] deleteInvoice: User authenticated: ${session.user.id}`);

  try {
    // First check if the invoice belongs to the user
    console.log(`[SERVER ACTION] Checking if invoice ${invoiceId} belongs to user ${session.user.id}`);
    const invoice = await db
      .select()
      .from(clientInvoices)
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );

    console.log(`[SERVER ACTION] Found invoice check result: ${invoice.length} matching invoices`);
    
    if (invoice.length === 0) {
      console.log(`[SERVER ACTION] Invoice not found or not owned by user`);
      return { success: false, error: "Invoice not found or you don't have permission to delete it." };
    }

    // Delete the invoice
    console.log(`[SERVER ACTION] Deleting invoice ${invoiceId}`);
    const deleteResult = await db
      .delete(clientInvoices)
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );
    
    console.log(`[SERVER ACTION] Delete completed with result:`, deleteResult);

    // Revalidate dashboard and invoices pages
    console.log(`[SERVER ACTION] Revalidating paths`);
    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION] Error deleting invoice:", error);
    return { success: false, error: "Failed to delete invoice" };
  }
}

export async function markInvoiceAsPaid(invoiceId: string) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in to update an invoice." };
  }

  try {
    // First check if the invoice belongs to the user
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
      return { success: false, error: "Invoice not found or you don't have permission to update it." };
    }

    // Update the invoice status to paid
    await db
      .update(clientInvoices)
      .set({ 
        status: "paid",
        updatedAt: new Date()
      })
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );

    // Revalidate dashboard and invoices pages
    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    
    return { success: true };
  } catch (error) {
    console.error("Error marking invoice as paid:", error);
    return { success: false, error: "Failed to update invoice status" };
  }
}

export async function updateInvoiceStatus(
  invoiceId: string, 
  status: "pending" | "paid" | "overdue" | "cancelled" | "draft" | "partially_paid"
) {
  console.log(`[SERVER ACTION] updateInvoiceStatus called with invoiceId=${invoiceId}, status=${status}`);
  
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    console.log(`[SERVER ACTION] Authentication failed - no user session`);
    return { success: false, error: "Unauthorized. Please sign in to update an invoice." };
  }
  
  console.log(`[SERVER ACTION] User authenticated: ${session.user.id}`);

  // Validate that the status is valid
  const validStatuses = invoiceStatusEnum.enumValues;
  if (!validStatuses.includes(status)) {
    console.log(`[SERVER ACTION] Invalid status: ${status}`);
    return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
  }

  try {
    // First check if the invoice belongs to the user
    console.log(`[SERVER ACTION] Checking if invoice ${invoiceId} belongs to user ${session.user.id}`);
    const invoice = await db
      .select()
      .from(clientInvoices)
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );

    console.log(`[SERVER ACTION] Found invoice check result: ${invoice.length} matching invoices`);
    
    if (invoice.length === 0) {
      console.log(`[SERVER ACTION] Invoice not found or not owned by user`);
      return { success: false, error: "Invoice not found or you don't have permission to update it." };
    }
    
    console.log(`[SERVER ACTION] Found invoice:`, invoice[0]);

    // Update the invoice status
    console.log(`[SERVER ACTION] Updating invoice ${invoiceId} status to ${status}`);
    const updateResult = await db
      .update(clientInvoices)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );
    
    console.log(`[SERVER ACTION] Update completed with result:`, updateResult);

    // Verify the update worked by retrieving the invoice again
    const updatedInvoice = await db
      .select()
      .from(clientInvoices)
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );
    
    console.log(`[SERVER ACTION] After update, invoice has status: ${updatedInvoice[0]?.status}`);

    // Revalidate dashboard and invoices pages
    console.log(`[SERVER ACTION] Revalidating paths`);
    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION] Error updating invoice status:", error);
    return { success: false, error: "Failed to update invoice status" };
  }
}

export async function updateInvoice(invoiceId: string, formData: FormData) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in to update an invoice." };
  }

  try {
    // Check if the invoice belongs to the user
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
      return { success: false, error: "Invoice not found or you don't have permission to update it." };
    }

    // Extract and validate form data with Zod
    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse and validate with Zod
    const validationResult = invoiceFormSchema.safeParse(rawFormData);
    
    if (!validationResult.success) {
      // Return validation errors
      return { 
        success: false, 
        error: "Invalid form data", 
        errors: validationResult.error.flatten().fieldErrors 
      };
    }
    
    const validData = validationResult.data;
    
    // Parse dates from strings
    const issueDate = new Date(validData.issueDate);
    const dueDate = new Date(validData.dueDate);

    // Update the invoice
    await db
      .update(clientInvoices)
      .set({
        clientName: validData.clientName,
        clientEmail: validData.clientEmail,
        invoiceNumber: validData.invoiceNumber,
        amount: String(validData.amount), // Convert to string for Drizzle
        currency: validData.currency,
        issueDate,
        dueDate,
        description: validData.description || "",
        additionalNotes: validData.additionalNotes || "",
        updatedAt: new Date()
      })
      .where(
        and(
          eq(clientInvoices.id, invoiceId),
          eq(clientInvoices.userId, session.user.id)
        )
      );

    // Revalidate dashboard and invoices pages
    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return { success: false, error: "Failed to update invoice" };
  }
} 