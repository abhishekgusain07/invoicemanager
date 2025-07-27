"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { generatedInvoices } from "@/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { type InvoiceGenerationData, invoiceGenerationSchema } from "@/lib/validations/invoice-generation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function saveGeneratedInvoice(invoiceData: InvoiceGenerationData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  try {
    // Validate the invoice data
    const validatedData = invoiceGenerationSchema.parse(invoiceData);
    
    // Calculate total amount
    const totalAmount = validatedData.items.reduce((total, item) => {
      const vatRate = typeof item.vat === 'number' ? item.vat : 0;
      const itemTotal = item.amount * item.netPrice * (1 + vatRate / 100);
      return total + itemTotal;
    }, 0);

    // Create shareable token
    const shareableToken = crypto.randomUUID();

    const invoiceId = crypto.randomUUID();
    
    await db.insert(generatedInvoices).values({
      id: invoiceId,
      userId: session.user.id,
      invoiceNumber: validatedData.invoiceNumberObject?.value || `INV-${Date.now()}`,
      invoiceTitle: validatedData.invoiceTitle || null,
      dateOfIssue: new Date(validatedData.dateOfIssue),
      paymentDue: new Date(validatedData.paymentDue),
      language: validatedData.language,
      currency: validatedData.currency,
      dateFormat: validatedData.dateFormat,
      template: validatedData.template,
      invoiceData: JSON.stringify(validatedData),
      totalAmount: totalAmount.toString(),
      shareableToken,
      isPubliclyShareable: false,
    });

    revalidatePath("/generateinvoice");
    return { success: true, invoiceId, shareableToken };
  } catch (error) {
    console.error("Failed to save generated invoice:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save invoice" 
    };
  }
}

export async function loadGeneratedInvoices() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  try {
    const invoices = await db
      .select()
      .from(generatedInvoices)
      .where(
        and(
          eq(generatedInvoices.userId, session.user.id),
          isNull(generatedInvoices.deletedAt)
        )
      )
      .orderBy(desc(generatedInvoices.updatedAt))
      .limit(50);

    return { success: true, invoices };
  } catch (error) {
    console.error("Failed to load generated invoices:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to load invoices" 
    };
  }
}

export async function loadGeneratedInvoice(invoiceId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  try {
    const invoice = await db
      .select()
      .from(generatedInvoices)
      .where(
        and(
          eq(generatedInvoices.id, invoiceId),
          eq(generatedInvoices.userId, session.user.id),
          isNull(generatedInvoices.deletedAt)
        )
      )
      .limit(1);

    if (!invoice[0]) {
      return { success: false, error: "Invoice not found" };
    }

    const invoiceData = JSON.parse(invoice[0].invoiceData) as InvoiceGenerationData;
    return { success: true, invoice: invoice[0], invoiceData };
  } catch (error) {
    console.error("Failed to load generated invoice:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to load invoice" 
    };
  }
}

export async function updateGeneratedInvoice(invoiceId: string, invoiceData: InvoiceGenerationData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  try {
    // Validate the invoice data
    const validatedData = invoiceGenerationSchema.parse(invoiceData);
    
    // Calculate total amount
    const totalAmount = validatedData.items.reduce((total, item) => {
      const vatRate = typeof item.vat === 'number' ? item.vat : 0;
      const itemTotal = item.amount * item.netPrice * (1 + vatRate / 100);
      return total + itemTotal;
    }, 0);

    await db
      .update(generatedInvoices)
      .set({
        invoiceNumber: validatedData.invoiceNumberObject?.value || `INV-${Date.now()}`,
        invoiceTitle: validatedData.invoiceTitle || null,
        dateOfIssue: new Date(validatedData.dateOfIssue),
        paymentDue: new Date(validatedData.paymentDue),
        language: validatedData.language,
        currency: validatedData.currency,
        dateFormat: validatedData.dateFormat,
        template: validatedData.template,
        invoiceData: JSON.stringify(validatedData),
        totalAmount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(generatedInvoices.id, invoiceId),
          eq(generatedInvoices.userId, session.user.id),
          isNull(generatedInvoices.deletedAt)
        )
      );

    revalidatePath("/generateinvoice");
    return { success: true };
  } catch (error) {
    console.error("Failed to update generated invoice:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update invoice" 
    };
  }
}

export async function deleteGeneratedInvoice(invoiceId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  try {
    await db
      .update(generatedInvoices)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(generatedInvoices.id, invoiceId),
          eq(generatedInvoices.userId, session.user.id),
          isNull(generatedInvoices.deletedAt)
        )
      );

    revalidatePath("/generateinvoice");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete generated invoice:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete invoice" 
    };
  }
}

export async function loadPublicInvoiceByToken(token: string) {
  try {
    const invoice = await db
      .select()
      .from(generatedInvoices)
      .where(
        and(
          eq(generatedInvoices.shareableToken, token),
          eq(generatedInvoices.isPubliclyShareable, true),
          isNull(generatedInvoices.deletedAt)
        )
      )
      .limit(1);

    if (!invoice[0]) {
      return { success: false, error: "Invoice not found or not publicly accessible" };
    }

    const invoiceData = JSON.parse(invoice[0].invoiceData) as InvoiceGenerationData;
    return { success: true, invoice: invoice[0], invoiceData };
  } catch (error) {
    console.error("Failed to load public invoice:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to load invoice" 
    };
  }
}