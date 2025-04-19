import { z } from "zod";
import { invoiceStatusEnum } from "@/db/schema";

// Convert the PostgreSQL enum to a Zod enum
const statusEnum = z.enum(['pending', 'paid', 'overdue', 'cancelled', 'draft', 'partially_paid']);

export const invoiceFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Please enter a valid email address"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  issueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid issue date",
  }),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid due date",
  }),
  description: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// Type for the form data
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// Extended schema that includes additional fields needed for the database
export const invoiceSchema = invoiceFormSchema.extend({
  id: z.string().uuid(),
  userId: z.string().min(1, "User ID is required"),
  status: statusEnum.default("pending"),
  paymentDate: z.date().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type for the full invoice data
export type Invoice = z.infer<typeof invoiceSchema>; 