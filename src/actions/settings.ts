"use server";

import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { userSettings, reminderToneEnum } from "@/db/schema";
import { 
  userSettingsSchema, 
  reminderSettingsSchema, 
  accountSettingsSchema,
  emailSettingsSchema,
  type ReminderSettingsValues,
  type AccountSettingsValues,
  type EmailSettingsValues,
  UserSettingsValues
} from "@/lib/validations/settings";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get user settings or create default ones if they don't exist
 */
export async function getUserSettings(): Promise<{ success: boolean, data: UserSettingsValues | null, error: string | null }> {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, data: null, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Try to get user settings
    const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

    // If no settings exist, create default ones
    if (!settings || settings.length === 0) {
      const defaultSettings = {
        id: uuidv4(),
        userId,
        // Use explicit enum values for the reminder tones
        firstReminderTone: "polite" as const,
        secondReminderTone: "firm" as const,
        thirdReminderTone: "urgent" as const,
        isAutomatedReminders: true,
        firstReminderDays: 3,
        followUpFrequency: 7,
        maxReminders: 3,
        previewEmails: true,
        emailSignature: "Best regards,"
      };

      // Create default settings in DB
      const newSettings = await db.insert(userSettings)
        .values(defaultSettings)
        .returning();

      return { success: true, data: newSettings[0] as UserSettingsValues, error: null };
    }

    return { success: true, data: settings[0] as UserSettingsValues, error: null };
  } catch (error) {
    console.error("Error getting user settings:", error);
    return { success: false, data: null, error: "Failed to get user settings" };
  }
}

/**
 * Update user reminder settings
 */
export async function updateReminderSettings(formData: FormData) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Convert FormData to object
    const rawData = Object.fromEntries(formData.entries());
    
    // Parse and validate with Zod
    const validationResult = reminderSettingsSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: "Invalid settings data", 
        errors: validationResult.error.flatten().fieldErrors 
      };
    }

    const validData = validationResult.data;
    
    // Check if user settings exist
    const userSettingsData = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

    if (!userSettingsData || userSettingsData.length === 0) {
      // Create new settings if they don't exist
      await db.insert(userSettings).values({
        id: uuidv4(),
        userId,
        ...validData
      });
    } else {
      // Update existing settings
      await db.update(userSettings)
        .set({
          ...validData,
          updatedAt: new Date()
        })
        .where(eq(userSettings.userId, userId));
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating reminder settings:", error);
    return { success: false, error: "Failed to update reminder settings" };
  }
}

/**
 * Update user account settings
 */
export async function updateAccountSettings(formData: FormData) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Convert FormData to object
    const rawData = Object.fromEntries(formData.entries());
    
    // Parse and validate with Zod
    const validationResult = accountSettingsSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: "Invalid settings data", 
        errors: validationResult.error.flatten().fieldErrors 
      };
    }

    const validData = validationResult.data;
    
    // Check if user settings exist
    const userSettingsData = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

    if (!userSettingsData || userSettingsData.length === 0) {
      // Create new settings if they don't exist
      await db.insert(userSettings).values({
        id: uuidv4(),
        userId,
        ...validData
      });
    } else {
      // Update existing settings
      await db.update(userSettings)
        .set({
          ...validData,
          updatedAt: new Date()
        })
        .where(eq(userSettings.userId, userId));
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating account settings:", error);
    return { success: false, error: "Failed to update account settings" };
  }
}

/**
 * Update user email settings
 */
export async function updateEmailSettings(formData: FormData) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Convert FormData to object
    const rawData = Object.fromEntries(formData.entries());
    
    // Parse and validate with Zod
    const validationResult = emailSettingsSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: "Invalid settings data", 
        errors: validationResult.error.flatten().fieldErrors 
      };
    }

    const validData = validationResult.data;
    
    // Check if user settings exist
    const userSettingsData = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

    if (!userSettingsData || userSettingsData.length === 0) {
      // Create new settings if they don't exist
      await db.insert(userSettings).values({
        id: uuidv4(),
        userId,
        ...validData
      });
    } else {
      // Update existing settings
      await db.update(userSettings)
        .set({
          ...validData,
          updatedAt: new Date()
        })
        .where(eq(userSettings.userId, userId));
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating email settings:", error);
    return { success: false, error: "Failed to update email settings" };
  }
}

/**
 * Update all user settings at once
 */
export async function updateAllSettings(formData: FormData) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Convert FormData to object
    const rawData = Object.fromEntries(formData.entries());
    
    // Create a processed data object with proper types
    const processedData: Record<string, any> = { ...rawData };
    
    // Process the reminder tone values to ensure they are valid enum values
    if (processedData.firstReminderTone) {
      processedData.firstReminderTone = String(processedData.firstReminderTone);
    }
    if (processedData.secondReminderTone) {
      processedData.secondReminderTone = String(processedData.secondReminderTone);
    }
    if (processedData.thirdReminderTone) {
      processedData.thirdReminderTone = String(processedData.thirdReminderTone);
    }
    
    // Convert string boolean values to actual booleans
    if (processedData.isAutomatedReminders !== undefined) {
      processedData.isAutomatedReminders = processedData.isAutomatedReminders === 'true';
    }
    if (processedData.previewEmails !== undefined) {
      processedData.previewEmails = processedData.previewEmails === 'true';
    }
    
    // Convert number fields
    if (processedData.firstReminderDays !== undefined) {
      processedData.firstReminderDays = Number(processedData.firstReminderDays);
    }
    if (processedData.followUpFrequency !== undefined) {
      processedData.followUpFrequency = Number(processedData.followUpFrequency);
    }
    if (processedData.maxReminders !== undefined) {
      processedData.maxReminders = Number(processedData.maxReminders);
    }
    
    // Handle date parsing for createdAt and updatedAt if they're present
    if (processedData.createdAt && typeof processedData.createdAt === 'string') {
      try {
        processedData.createdAt = new Date(processedData.createdAt);
      } catch (e) {
        delete processedData.createdAt;
      }
    }
    
    if (processedData.updatedAt && typeof processedData.updatedAt === 'string') {
      try {
        processedData.updatedAt = new Date(processedData.updatedAt);
      } catch (e) {
        delete processedData.updatedAt;
      }
    }
    
    // Add userId to the data
    const dataWithUserId = {
      ...processedData,
      userId
    };
    
    // Parse and validate with Zod
    const validationResult = userSettingsSchema.safeParse(dataWithUserId);
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: "Invalid settings data", 
        errors: validationResult.error.flatten().fieldErrors 
      };
    }

    const validData = validationResult.data;
    
    // Check if user settings exist
    const userSettingsData = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

    if (!userSettingsData || userSettingsData.length === 0) {
      // Create new settings if they don't exist
      const result = await db.insert(userSettings).values({
        id: uuidv4(),
        ...validData
      }).returning();
    } else {
      // Update existing settings
      const result = await db.update(userSettings)
        .set({
          ...validData,
          updatedAt: new Date()
        })
        .where(eq(userSettings.userId, userId))
        .returning();
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
} 