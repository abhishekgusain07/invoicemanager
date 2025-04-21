import { z } from "zod";
import { reminderToneEnum } from "@/db/schema";

// Convert PostgreSQL enums to Zod enums
const toneEnum = z.enum(['polite', 'friendly', 'neutral', 'firm', 'direct', 'assertive', 'urgent', 'final', 'serious']);

// Reminder Settings schema
export const reminderSettingsSchema = z.object({
  isAutomatedReminders: z.preprocess(val => val === 'true' || val === true, z.boolean()).default(true),
  firstReminderDays: z.coerce.number().int().min(1).max(30).default(3),
  followUpFrequency: z.coerce.number().int().min(1).max(30).default(7),
  maxReminders: z.coerce.number().int().min(1).max(10).default(3),
  firstReminderTone: toneEnum.default("polite"),
  secondReminderTone: toneEnum.default("firm"),
  thirdReminderTone: toneEnum.default("urgent"),
});

// Account Settings schema
export const accountSettingsSchema = z.object({
  businessName: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
});

// Email Settings schema
export const emailSettingsSchema = z.object({
  fromName: z.string().max(100).optional(),
  emailSignature: z.string().max(500).default("Best regards,"),
  defaultCC: z.string().email().optional().or(z.literal('')),
  defaultBCC: z.string().email().optional().or(z.literal('')),
  previewEmails: z.preprocess(val => val === 'true' || val === true, z.boolean()).default(true),
  reminderTemplate: z.string().optional(),
  followUpTemplate: z.string().optional(),
  finalReminderTemplate: z.string().optional(),
  ccAccountant: z.preprocess(val => val === 'true' || val === true, z.boolean()).default(false),
  useBrandedEmails: z.preprocess(val => val === 'true' || val === true, z.boolean()).default(false),
  sendCopyToSelf: z.preprocess(val => val === 'true' || val === true, z.boolean()).default(false),
  ccEmails: z.string().max(500).optional(),
  senderName: z.string().max(100).optional(),
  firstReminderTemplateId: z.string().optional(),
  followUpTemplateId: z.string().optional(),
  finalNoticeTemplateId: z.string().optional(),
});

// Combined settings schema
export const userSettingsSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  ...reminderSettingsSchema.shape,
  ...accountSettingsSchema.shape,
  ...emailSettingsSchema.shape,
});

// Types for the settings forms
export type ReminderSettingsValues = z.infer<typeof reminderSettingsSchema>;
export type AccountSettingsValues = z.infer<typeof accountSettingsSchema>;
export type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
export type UserSettingsValues = z.infer<typeof userSettingsSchema>; 