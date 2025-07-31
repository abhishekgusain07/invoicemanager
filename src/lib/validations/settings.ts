import { z } from "zod";
import { reminderToneEnum } from "@/db/schema";

// Convert PostgreSQL enums to Zod enums
const toneEnum = z.enum([
  "polite",
  "friendly",
  "neutral",
  "firm",
  "direct",
  "assertive",
  "urgent",
  "final",
  "serious",
]);

// Reminder Settings schema
export const reminderSettingsSchema = z.object({
  isAutomatedReminders: z.boolean(),
  firstReminderDays: z.number().int().min(1).max(30),
  followUpFrequency: z.number().int().min(1).max(30),
  maxReminders: z.number().int().min(1).max(10),
  firstReminderTone: toneEnum,
  secondReminderTone: toneEnum,
  thirdReminderTone: toneEnum,
});

// Account Settings schema
export const accountSettingsSchema = z.object({
  businessName: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
});

// Email Settings schema
export const emailSettingsSchema = z.object({
  fromName: z.string().max(100).optional(),
  emailSignature: z.string().max(500),
  defaultCC: z.string().email().optional().or(z.literal("")),
  defaultBCC: z.string().email().optional().or(z.literal("")),
  previewEmails: z.boolean(),
  ccAccountant: z.boolean(),
  useBrandedEmails: z.boolean(),
  sendCopyToSelf: z.boolean(),
  reminderTemplate: z.string().optional(),
  followUpTemplate: z.string().optional(),
  finalReminderTemplate: z.string().optional(),
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
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  ...reminderSettingsSchema.shape,
  ...accountSettingsSchema.shape,
  ...emailSettingsSchema.shape,
});

// Types for the settings forms
export type ReminderSettingsValues = z.infer<typeof reminderSettingsSchema>;
export type AccountSettingsValues = z.infer<typeof accountSettingsSchema>;
export type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
export type UserSettingsValues = z.infer<typeof userSettingsSchema>;

// Database return types (with nullable fields)
export type ReminderSettingsDB = {
  isAutomatedReminders: boolean | null;
  firstReminderDays: number | null;
  followUpFrequency: number | null;
  maxReminders: number | null;
  firstReminderTone: "polite" | "friendly" | "neutral" | "firm" | "direct" | "assertive" | "urgent" | "final" | "serious" | null;
  secondReminderTone: "polite" | "friendly" | "neutral" | "firm" | "direct" | "assertive" | "urgent" | "final" | "serious" | null;
  thirdReminderTone: "polite" | "friendly" | "neutral" | "firm" | "direct" | "assertive" | "urgent" | "final" | "serious" | null;
};

export type AccountSettingsDB = {
  businessName: string | null;
  phoneNumber: string | null;
};

export type EmailSettingsDB = {
  fromName: string | null;
  emailSignature: string | null;
  defaultCC: string | null;
  defaultBCC: string | null;
  previewEmails: boolean | null;
  ccAccountant: boolean | null;
  useBrandedEmails: boolean | null;
  sendCopyToSelf: boolean | null;
};
