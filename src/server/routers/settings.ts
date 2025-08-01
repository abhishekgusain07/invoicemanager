import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  userSettingsSchema,
  reminderSettingsSchema,
  accountSettingsSchema,
  emailSettingsSchema,
  type UserSettingsValues,
} from "@/lib/validations/settings";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

export const settingsRouter = createTRPCRouter({
  // Get all user settings (migrated from server action)
  getUserSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const settings = await ctx.db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      // If no settings exist, create default ones
      if (!settings || settings.length === 0) {
        const defaultSettings = {
          id: uuidv4(),
          userId: ctx.user.id,
          // Use explicit enum values for the reminder tones
          firstReminderTone: "polite" as const,
          secondReminderTone: "firm" as const,
          thirdReminderTone: "urgent" as const,
          isAutomatedReminders: true,
          firstReminderDays: 3,
          followUpFrequency: 7,
          maxReminders: 3,
          previewEmails: true,
          emailSignature: "Best regards,",
          ccAccountant: false,
          useBrandedEmails: false,
          sendCopyToSelf: false,
        };

        // Create default settings in DB
        const newSettings = await ctx.db
          .insert(userSettings)
          .values(defaultSettings)
          .returning();

        // Convert nullable fields to non-null before type assertion
        const sanitizedSettings = {
          ...newSettings[0],
          isAutomatedReminders: newSettings[0].isAutomatedReminders ?? true,
          firstReminderDays: newSettings[0].firstReminderDays ?? 3,
          followUpFrequency: newSettings[0].followUpFrequency ?? 7,
          maxReminders: newSettings[0].maxReminders ?? 3,
          firstReminderTone: newSettings[0].firstReminderTone ?? "polite",
          secondReminderTone: newSettings[0].secondReminderTone ?? "firm",
          thirdReminderTone: newSettings[0].thirdReminderTone ?? "urgent",
          ccAccountant: false,
          useBrandedEmails: false,
          sendCopyToSelf: false,
        };

        return {
          success: true,
          data: sanitizedSettings as UserSettingsValues,
          error: null,
        };
      }

      // Convert nullable fields to non-null before type assertion
      const sanitizedSettings = {
        ...settings[0],
        isAutomatedReminders: settings[0].isAutomatedReminders ?? true,
        firstReminderDays: settings[0].firstReminderDays ?? 3,
        followUpFrequency: settings[0].followUpFrequency ?? 7,
        maxReminders: settings[0].maxReminders ?? 3,
        firstReminderTone: settings[0].firstReminderTone ?? "polite",
        secondReminderTone: settings[0].secondReminderTone ?? "firm",
        thirdReminderTone: settings[0].thirdReminderTone ?? "urgent",
        ccAccountant: false,
        useBrandedEmails: false,
        sendCopyToSelf: false,
      };

      return {
        success: true,
        data: sanitizedSettings as UserSettingsValues,
        error: null,
      };
    } catch (error) {
      console.error("Error getting user settings:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get user settings",
      });
    }
  }),

  // Get reminder settings only
  getReminderSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db
      .select({
        isAutomatedReminders: userSettings.isAutomatedReminders,
        firstReminderDays: userSettings.firstReminderDays,
        followUpFrequency: userSettings.followUpFrequency,
        maxReminders: userSettings.maxReminders,
        firstReminderTone: userSettings.firstReminderTone,
        secondReminderTone: userSettings.secondReminderTone,
        thirdReminderTone: userSettings.thirdReminderTone,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);

    return settings[0] ?? null;
  }),

  // Get account settings only
  getAccountSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db
      .select({
        businessName: userSettings.businessName,
        phoneNumber: userSettings.phoneNumber,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);

    return settings[0] ?? null;
  }),

  // Get email settings only
  getEmailSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db
      .select({
        fromName: userSettings.fromName,
        emailSignature: userSettings.emailSignature,
        defaultCC: userSettings.defaultCC,
        defaultBCC: userSettings.defaultBCC,
        previewEmails: userSettings.previewEmails,
        ccAccountant: userSettings.ccAccountant,
        useBrandedEmails: userSettings.useBrandedEmails,
        sendCopyToSelf: userSettings.sendCopyToSelf,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);

    return settings[0] ?? null;
  }),

  // Update all settings (migrated from server action)
  updateAllSettings: protectedProcedure
    .input(userSettingsSchema.omit({ id: true, userId: true }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if settings exist
        const existingSettings = await ctx.db
          .select({ id: userSettings.id })
          .from(userSettings)
          .where(eq(userSettings.userId, ctx.user.id))
          .limit(1);

        if (existingSettings.length > 0) {
          // Update existing settings
          const updated = await ctx.db
            .update(userSettings)
            .set({
              ...input,
              updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, ctx.user.id))
            .returning();

          return { success: true, data: updated[0] };
        } else {
          // Create new settings
          const created = await ctx.db
            .insert(userSettings)
            .values({
              id: uuidv4(),
              userId: ctx.user.id,
              ...input,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          return { success: true, data: created[0] };
        }
      } catch (error) {
        console.error("Error updating settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update settings",
        });
      }
    }),

  // Update settings (legacy method for compatibility)
  updateSettings: protectedProcedure
    .input(userSettingsSchema.omit({ id: true, userId: true }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if settings exist
        const existingSettings = await ctx.db
          .select({ id: userSettings.id })
          .from(userSettings)
          .where(eq(userSettings.userId, ctx.user.id))
          .limit(1);

        if (existingSettings.length > 0) {
          // Update existing settings
          const updated = await ctx.db
            .update(userSettings)
            .set({
              ...input,
              updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, ctx.user.id))
            .returning();

          return updated[0];
        } else {
          // Create new settings
          const created = await ctx.db
            .insert(userSettings)
            .values({
              id: uuidv4(),
              userId: ctx.user.id,
              ...input,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          return created[0];
        }
      } catch (error) {
        console.error("Error updating settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update settings",
        });
      }
    }),

  // Update reminder settings only (migrated from server action)
  updateReminderSettings: protectedProcedure
    .input(reminderSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if settings exist
        const existingSettings = await ctx.db
          .select({ id: userSettings.id })
          .from(userSettings)
          .where(eq(userSettings.userId, ctx.user.id))
          .limit(1);

        if (existingSettings.length > 0) {
          // Update existing settings
          const updated = await ctx.db
            .update(userSettings)
            .set({
              ...input,
              updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, ctx.user.id))
            .returning();

          return { success: true, data: updated[0] };
        } else {
          // Create new settings with defaults
          const created = await ctx.db
            .insert(userSettings)
            .values({
              id: uuidv4(),
              userId: ctx.user.id,
              ...input,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          return { success: true, data: created[0] };
        }
      } catch (error) {
        console.error("Error updating reminder settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update reminder settings",
        });
      }
    }),

  // Update account settings only (migrated from server action)
  updateAccountSettings: protectedProcedure
    .input(accountSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if settings exist
        const existingSettings = await ctx.db
          .select({ id: userSettings.id })
          .from(userSettings)
          .where(eq(userSettings.userId, ctx.user.id))
          .limit(1);

        if (existingSettings.length > 0) {
          // Update existing settings
          const updated = await ctx.db
            .update(userSettings)
            .set({
              ...input,
              updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, ctx.user.id))
            .returning();

          return { success: true, data: updated[0] };
        } else {
          // Create new settings with defaults
          const created = await ctx.db
            .insert(userSettings)
            .values({
              id: uuidv4(),
              userId: ctx.user.id,
              ...input,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          return { success: true, data: created[0] };
        }
      } catch (error) {
        console.error("Error updating account settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update account settings",
        });
      }
    }),

  // Update email settings only (migrated from server action)
  updateEmailSettings: protectedProcedure
    .input(emailSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if settings exist
        const existingSettings = await ctx.db
          .select({ id: userSettings.id })
          .from(userSettings)
          .where(eq(userSettings.userId, ctx.user.id))
          .limit(1);

        if (existingSettings.length > 0) {
          // Update existing settings
          const updated = await ctx.db
            .update(userSettings)
            .set({
              ...input,
              updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, ctx.user.id))
            .returning();

          return { success: true, data: updated[0] };
        } else {
          // Create new settings with defaults
          const created = await ctx.db
            .insert(userSettings)
            .values({
              id: uuidv4(),
              userId: ctx.user.id,
              ...input,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          return { success: true, data: created[0] };
        }
      } catch (error) {
        console.error("Error updating email settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update email settings",
        });
      }
    }),

  // Delete user settings
  deleteSettings: protectedProcedure.mutation(async ({ ctx }) => {
    const deleted = await ctx.db
      .delete(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .returning();

    return deleted[0] ?? null;
  }),

  // Reset settings to defaults
  resetToDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    const defaultSettings = {
      isAutomatedReminders: true,
      firstReminderDays: 3,
      followUpFrequency: 7,
      maxReminders: 3,
      firstReminderTone: "polite" as const,
      secondReminderTone: "firm" as const,
      thirdReminderTone: "urgent" as const,
      emailSignature: "Best regards,",
      previewEmails: true,
      ccAccountant: false,
      useBrandedEmails: false,
      sendCopyToSelf: false,
    };

    // Check if settings exist
    const existingSettings = await ctx.db
      .select({ id: userSettings.id })
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);

    if (existingSettings.length > 0) {
      // Update existing settings
      const updated = await ctx.db
        .update(userSettings)
        .set({
          ...defaultSettings,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, ctx.user.id))
        .returning();

      return updated[0];
    } else {
      // Create new settings with defaults
      const created = await ctx.db
        .insert(userSettings)
        .values({
          id: nanoid(),
          userId: ctx.user.id,
          ...defaultSettings,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return created[0];
    }
  }),
});
