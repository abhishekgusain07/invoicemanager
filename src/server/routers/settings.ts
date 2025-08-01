import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  userSettingsSchema,
  reminderSettingsSchema,
  accountSettingsSchema,
  emailSettingsSchema,
} from "@/lib/validations/settings";
import { nanoid } from "nanoid";

export const settingsRouter = createTRPCRouter({
  // Get all user settings
  getUserSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);

    return settings[0] ?? null;
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

  // Update all settings
  updateSettings: protectedProcedure
    .input(userSettingsSchema.omit({ id: true, userId: true }))
    .mutation(async ({ ctx, input }) => {
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
            id: nanoid(),
            userId: ctx.user.id,
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return created[0];
      }
    }),

  // Update reminder settings only
  updateReminderSettings: protectedProcedure
    .input(reminderSettingsSchema)
    .mutation(async ({ ctx, input }) => {
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
        // Create new settings with defaults
        const created = await ctx.db
          .insert(userSettings)
          .values({
            id: nanoid(),
            userId: ctx.user.id,
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return created[0];
      }
    }),

  // Update account settings only
  updateAccountSettings: protectedProcedure
    .input(accountSettingsSchema)
    .mutation(async ({ ctx, input }) => {
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
        // Create new settings with defaults
        const created = await ctx.db
          .insert(userSettings)
          .values({
            id: nanoid(),
            userId: ctx.user.id,
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return created[0];
      }
    }),

  // Update email settings only
  updateEmailSettings: protectedProcedure
    .input(emailSettingsSchema)
    .mutation(async ({ ctx, input }) => {
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
        // Create new settings with defaults
        const created = await ctx.db
          .insert(userSettings)
          .values({
            id: nanoid(),
            userId: ctx.user.id,
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return created[0];
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
