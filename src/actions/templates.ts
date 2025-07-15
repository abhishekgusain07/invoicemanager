"use server";

import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { emailTemplates } from "@/db/schema";
import { 
  createTemplateSchema,
  updateTemplateSchema,
  emailTemplateSchema,
  type EmailTemplate
} from "@/lib/validations/email-template";
import { eq, and, not } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get all templates for a user
 */
export async function getTemplates(): Promise<{ success: boolean, data: EmailTemplate[] | null, error: string | null }> {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) {
    return { success: false, data: null, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Get all templates for the user
    const templates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.userId, userId))
      .orderBy(emailTemplates.name);

    return { success: true, data: templates as EmailTemplate[], error: null };
  } catch (error) {
    console.error("Error getting templates:", error);
    return { success: false, data: null, error: "Failed to get templates" };
  }
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(id: string): Promise<{ success: boolean, data: EmailTemplate | null, error: string | null }> {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) {
    return { success: false, data: null, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Get template by ID and ensure it belongs to the user
    const template = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.id, id),
          eq(emailTemplates.userId, userId)
        )
      );

    if (!template || template.length === 0) {
      return { success: false, data: null, error: "Template not found" };
    }

    return { success: true, data: template[0] as EmailTemplate, error: null };
  } catch (error) {
    console.error("Error getting template:", error);
    return { success: false, data: null, error: "Failed to get template" };
  }
}

/**
 * Create a new template
 */
export async function createTemplate(formData: FormData) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Convert FormData to object
    const rawData = Object.fromEntries(formData.entries());
    
    // Add userId to the data
    const dataWithUserId = {
      ...rawData,
      userId,
      isDefault: rawData.isDefault === 'true'
    };
    
    // Parse and validate with Zod
    const validationResult = createTemplateSchema.safeParse(dataWithUserId);
    
    if (!validationResult.success) {
      const errorDetails = validationResult.error.flatten();
      console.error("Template creation validation failed:", {
        formErrors: errorDetails.formErrors,
        fieldErrors: errorDetails.fieldErrors,
        rawData: dataWithUserId
      });
      
      // Create user-friendly error message
      const fieldErrors = errorDetails.fieldErrors;
      const errorMessages = [];
      
      if (fieldErrors.name) errorMessages.push(`Name: ${fieldErrors.name.join(', ')}`);
      if (fieldErrors.subject) errorMessages.push(`Subject: ${fieldErrors.subject.join(', ')}`);
      if (fieldErrors.content) errorMessages.push(`Content: ${fieldErrors.content.join(', ')}`);
      if (fieldErrors.tone) errorMessages.push(`Tone: ${fieldErrors.tone.join(', ')}`);
      if (fieldErrors.category) errorMessages.push(`Category: ${fieldErrors.category.join(', ')}`);
      
      const userFriendlyError = errorMessages.length > 0 
        ? `Validation failed: ${errorMessages.join('; ')}`
        : "Invalid template data. Please check your input.";
      
      return { 
        success: false, 
        error: userFriendlyError, 
        errors: errorDetails.fieldErrors 
      };
    }

    const validData = validationResult.data;
    
    // If this is a default template, unset other defaults with the same tone
    if (validData.isDefault) {
      await db.update(emailTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(emailTemplates.userId, userId),
            eq(emailTemplates.tone, validData.tone as any)
          )
        );
    }
    
    // Create the template
    const newTemplate = await db.insert(emailTemplates)
      .values({
        id: uuidv4(),
        ...validData
      })
      .returning();

    revalidatePath("/templates");
    return { success: true, data: newTemplate[0] };
  } catch (error) {
    console.error("Error creating template:", error);
    return { success: false, error: "Failed to create template" };
  }
}

/**
 * Update an existing template
 */
export async function updateTemplate(id: string, formData: FormData) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Check if the template exists and belongs to the user
    const existingTemplate = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.id, id),
          eq(emailTemplates.userId, userId)
        )
      );

    if (!existingTemplate || existingTemplate.length === 0) {
      return { success: false, error: "Template not found" };
    }

    // Convert FormData to object with proper type conversions
    const rawData = Object.fromEntries(formData.entries());
    
    // Prepare data for update with proper type conversions
    const updateData = {
      id,
      userId,
      name: rawData.name as string,
      subject: rawData.subject as string,
      content: rawData.content as string,
      htmlContent: rawData.htmlContent as string || undefined,
      textContent: rawData.textContent as string || undefined,
      description: rawData.description as string || undefined,
      tone: rawData.tone as string,
      category: rawData.category as string,
      isDefault: rawData.isDefault === 'true',
      // Don't update system fields
      templateType: undefined,
      isActive: undefined,
      usageCount: undefined,
      tags: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    // Parse and validate with update schema
    const validationResult = updateTemplateSchema.safeParse(cleanUpdateData);
    
    if (!validationResult.success) {
      const errorDetails = validationResult.error.flatten();
      console.error("Template validation failed:", {
        formErrors: errorDetails.formErrors,
        fieldErrors: errorDetails.fieldErrors,
        rawData: cleanUpdateData
      });
      
      // Create user-friendly error message
      const fieldErrors = errorDetails.fieldErrors;
      const errorMessages = [];
      
      if (fieldErrors.name) errorMessages.push(`Name: ${fieldErrors.name.join(', ')}`);
      if (fieldErrors.subject) errorMessages.push(`Subject: ${fieldErrors.subject.join(', ')}`);
      if (fieldErrors.content) errorMessages.push(`Content: ${fieldErrors.content.join(', ')}`);
      if (fieldErrors.tone) errorMessages.push(`Tone: ${fieldErrors.tone.join(', ')}`);
      if (fieldErrors.category) errorMessages.push(`Category: ${fieldErrors.category.join(', ')}`);
      
      const userFriendlyError = errorMessages.length > 0 
        ? `Validation failed: ${errorMessages.join('; ')}`
        : "Invalid template data. Please check your input.";
      
      return { 
        success: false, 
        error: userFriendlyError, 
        errors: errorDetails.fieldErrors 
      };
    }

    const validData = validationResult.data;
    
    // If this is a default template, unset other defaults with the same tone
    if (validData.isDefault) {
      await db.update(emailTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(emailTemplates.userId, userId),
            eq(emailTemplates.tone, validData.tone as any),
            not(eq(emailTemplates.id, id))
          )
        );
    }
    
    // Update the template with all provided fields
    const updateFields: any = {
      updatedAt: new Date()
    };
    
    // Only update fields that are provided
    if (validData.name) updateFields.name = validData.name;
    if (validData.subject) updateFields.subject = validData.subject;
    if (validData.content) updateFields.content = validData.content;
    if (validData.htmlContent !== undefined) updateFields.htmlContent = validData.htmlContent;
    if (validData.textContent !== undefined) updateFields.textContent = validData.textContent;
    if (validData.description !== undefined) updateFields.description = validData.description;
    if (validData.tone) updateFields.tone = validData.tone as any;
    if (validData.category) updateFields.category = validData.category as any;
    if (validData.isDefault !== undefined) updateFields.isDefault = validData.isDefault;
    
    const updatedTemplate = await db.update(emailTemplates)
      .set(updateFields)
      .where(
        and(
          eq(emailTemplates.id, id),
          eq(emailTemplates.userId, userId)
        )
      )
      .returning();

    revalidatePath("/templates");
    return { success: true, data: updatedTemplate[0] };
  } catch (error) {
    console.error("Error updating template:", error);
    return { success: false, error: "Failed to update template" };
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Check if the template exists and belongs to the user
    const existingTemplate = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.id, id),
          eq(emailTemplates.userId, userId)
        )
      );

    if (!existingTemplate || existingTemplate.length === 0) {
      return { success: false, error: "Template not found" };
    }

    // Delete the template
    await db.delete(emailTemplates)
      .where(
        and(
          eq(emailTemplates.id, id),
          eq(emailTemplates.userId, userId)
        )
      );

    revalidatePath("/templates");
    return { success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { success: false, error: "Failed to delete template" };
  }
}

/**
 * Get templates by tone
 */
export async function getTemplatesByTone(tone: string): Promise<{ success: boolean, data: EmailTemplate[] | null, error: string | null }> {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) {
    return { success: false, data: null, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Get templates by tone for the user
    const templates = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.userId, userId),
          eq(emailTemplates.tone, tone as any)
        )
      )
      .orderBy(emailTemplates.name);

    return { success: true, data: templates as EmailTemplate[], error: null };
  } catch (error) {
    console.error("Error getting templates by tone:", error);
    return { success: false, data: null, error: "Failed to get templates" };
  }
} 