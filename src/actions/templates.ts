"use server";

import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { emailTemplates } from "@/db/schema";
import { 
  createTemplateSchema,
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
      return { 
        success: false, 
        error: "Invalid template data", 
        errors: validationResult.error.flatten().fieldErrors 
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

    // Convert FormData to object
    const rawData = Object.fromEntries(formData.entries());
    
    // Add userId and id to the data
    const dataWithUserIdAndId = {
      ...rawData,
      userId,
      id,
      isDefault: rawData.isDefault === 'true'
    };
    
    // Parse and validate with Zod
    const validationResult = emailTemplateSchema.safeParse(dataWithUserIdAndId);
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: "Invalid template data", 
        errors: validationResult.error.flatten().fieldErrors 
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
    
    // Update the template
    const updatedTemplate = await db.update(emailTemplates)
      .set({
        name: validData.name,
        subject: validData.subject,
        content: validData.content,
        tone: validData.tone as any,
        isDefault: validData.isDefault,
        updatedAt: new Date()
      })
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