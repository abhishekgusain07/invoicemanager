"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { clientInvoices } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import { v4 as uuidv4 } from "uuid";
import { invoiceFormSchema } from "@/lib/validations/invoice";
import { eq } from "drizzle-orm";

export async function createInvoice(formData: FormData) {
  // Check if user is authenticated
  const session = await authClient.getSession();
  if (!session?.data?.user) {
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
      userId: session.data.user.id,
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
  const session = await authClient.getSession();
  if (!session?.data?.user) {
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
    const userInvoices = await db.query.clientInvoices.findMany({
      where: eq(clientInvoices.userId, session.data.user.id),
    });

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
  // Check if user is authenticated
  const session = await authClient.getSession();
  if (!session?.data?.user) {
    return [];
  }

  try {
    // Fetch all user invoices
    const userInvoices = await db.query.clientInvoices.findMany({
      where: eq(clientInvoices.userId, session.data.user.id),
    });

    const now = new Date();
    
    if (status === "all") {
      return userInvoices;
    } else if (status === "overdue") {
      return userInvoices.filter(
        invoice => invoice.status === "pending" && invoice.dueDate < now
      );
    } else {
      return userInvoices.filter(invoice => invoice.status === status);
    }
  } catch (error) {
    console.error(`Error fetching ${status} invoices:`, error);
    return [];
  }
}

export async function getMonthlyInvoiceData() {
  // Check if user is authenticated
  const session = await authClient.getSession();
  if (!session?.data?.user) {
    return [];
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  try {
    // Fetch all user invoices
    const userInvoices = await db.query.clientInvoices.findMany({
      where: eq(clientInvoices.userId, session.data.user.id),
    });

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