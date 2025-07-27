import { z } from "zod";
import {
  reminderToneEnum,
  templateTypeEnum,
  templateCategoryEnum,
} from "@/db/schema";

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
const templateTypeEnumZ = z.enum(["system", "custom"]);
const templateCategoryEnumZ = z.enum([
  "reminder",
  "thank_you",
  "follow_up",
  "notice",
  "welcome",
  "custom",
]);

// Enhanced Email Template schema
export const emailTemplateSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(1, "Template name is required").max(100),
  subject: z.string().min(1, "Subject is required").max(150),

  // Enhanced content support
  content: z.string().min(1, "Template content is required").max(100000),
  htmlContent: z.string().optional(),
  textContent: z.string().optional(),

  // Template organization
  tone: toneEnum,
  templateType: templateTypeEnumZ.default("custom"),
  category: templateCategoryEnumZ.default("reminder"),

  // Template metadata
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  usageCount: z.number().default(0),
  description: z.string().optional(),
  tags: z.string().optional(), // JSON string of tags array

  // Timestamps (handled by database)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create template schema (without id and system fields)
export const createTemplateSchema = emailTemplateSchema.omit({
  id: true,
  usageCount: true,
  createdAt: true,
  updatedAt: true,
});

// Update template schema
export const updateTemplateSchema = emailTemplateSchema.partial().extend({
  id: z.string(),
});

// Template rendering data schema (for placeholder replacement)
export const templateRenderDataSchema = z.object({
  clientName: z.string(),
  clientEmail: z.string(),
  invoiceNumber: z.string(),
  invoiceAmount: z.string(),
  currency: z.string(),
  dueDate: z.string(),
  issueDate: z.string(),
  daysOverdue: z.number(),
  senderName: z.string(),
  companyName: z.string().optional(),
  invoiceLink: z.string().optional(),
  customFields: z.record(z.string()).optional(),
});

// Types for the email template
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplateRenderData = z.infer<typeof templateRenderDataSchema>;

// Template placeholder types
export const TEMPLATE_PLACEHOLDERS = {
  // Client information
  CLIENT_NAME: "{client_name}",
  CLIENT_EMAIL: "{client_email}",

  // Invoice details
  INVOICE_NUMBER: "{invoice_number}",
  INVOICE_AMOUNT: "{invoice_amount}",
  CURRENCY: "{currency}",
  DUE_DATE: "{due_date}",
  ISSUE_DATE: "{issue_date}",
  DAYS_OVERDUE: "{days_overdue}",

  // Sender information
  SENDER_NAME: "{sender_name}",
  COMPANY_NAME: "{company_name}",

  // Links and actions
  INVOICE_LINK: "{invoice_link}",
  PAYMENT_LINK: "{payment_link}",

  // Dates
  CURRENT_DATE: "{current_date}",

  // Custom fields
  CUSTOM_MESSAGE: "{custom_message}",
} as const;

export type TemplatePlaceholder =
  (typeof TEMPLATE_PLACEHOLDERS)[keyof typeof TEMPLATE_PLACEHOLDERS];
