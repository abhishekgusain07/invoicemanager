import { z } from "zod";
import { reminderToneEnum } from "@/db/schema";

// Convert PostgreSQL enums to Zod enums
const toneEnum = z.enum(['polite', 'friendly', 'neutral', 'firm', 'direct', 'assertive', 'urgent', 'final', 'serious']);

// Email Template schema
export const emailTemplateSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(1, "Template name is required").max(100),
  subject: z.string().min(1, "Subject is required").max(150),
  content: z.string().min(1, "Template content is required").max(5000),
  tone: toneEnum,
  isDefault: z.boolean().default(false),
});

// Create template schema (without id)
export const createTemplateSchema = emailTemplateSchema.omit({ id: true });

// Types for the email template
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>; 