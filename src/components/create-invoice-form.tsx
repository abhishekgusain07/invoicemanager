"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusIcon, XIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { createInvoice, updateInvoice } from "@/actions/invoice";
import { invoiceFormSchema, type InvoiceFormValues } from "@/lib/validations/invoice";
import { deepEqual } from "@/lib/utils";

// Add a type for the invoice data
interface InvoiceData {
  id: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  description: string;
  additionalNotes: string;
  status: string;
}

interface CreateInvoiceFormProps {
  onClose: () => void;
  initialData?: InvoiceData;
  isEditing?: boolean;
}

export function CreateInvoiceForm({ onClose, initialData, isEditing = false }: CreateInvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalValues, setOriginalValues] = useState<InvoiceFormValues | null>(null);

  // Format date for form input (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    return date instanceof Date 
      ? date.toISOString().split('T')[0]
      : new Date(date).toISOString().split('T')[0];
  };

  // Get default values - memoize to prevent recreation on every render
  const defaultValues = useMemo(() => {
    if (initialData) {
      const values = {
        clientName: initialData.clientName,
        clientEmail: initialData.clientEmail,
        invoiceNumber: initialData.invoiceNumber,
        amount: parseFloat(initialData.amount),
        currency: initialData.currency,
        issueDate: formatDate(initialData.issueDate),
        dueDate: formatDate(initialData.dueDate),
        description: initialData.description || "",
        additionalNotes: initialData.additionalNotes || ""
      };
      return values;
    }

    return {
      clientName: "",
      clientEmail: "",
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: 0,
      currency: "USD",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: "",
      additionalNotes: "",
    };
  }, [initialData]);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  });

  // Set original values once when the form is initialized
  useEffect(() => {
    if (isEditing && initialData) {
      setOriginalValues(defaultValues);
    }
  }, [isEditing, initialData, defaultValues]);

  // Watch for form value changes to enable/disable the submit button - memoize to prevent recalculation on every render
  const formValues = form.watch();
  
  const hasChanges = useMemo(() => {
    return isEditing && originalValues ? !deepEqual(originalValues, formValues) : true;
  }, [isEditing, originalValues, formValues]);

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);

    try {
      // Create a FormData object to send to the server action
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      let result;
      
      if (isEditing && initialData) {
        result = await updateInvoice(initialData.id, formData);
        if (result.success) {
          toast.success("Invoice updated successfully!");
          onClose();
        } else {
          toast.error(result.error || "Failed to update invoice");
        }
      } else {
        result = await createInvoice(formData);
        if (result.success) {
          toast.success("Invoice created successfully!");
          onClose();
        } else {
          toast.error(result.error || "Failed to create invoice");
        }
      }
    } catch (error) {
      console.error(isEditing ? "Error updating invoice:" : "Error creating invoice:", error);
      toast.error(isEditing ? "Failed to update invoice. Please try again." : "Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Invoice" : "Create New Invoice"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter client name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="client@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="INV-123456"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          // Convert string to number for controlled input
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Invoice description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Payment instructions or additional notes"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || (isEditing && !hasChanges)}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <>
                        <CheckIcon className="mr-2 h-4 w-4" /> Update Invoice
                      </>
                    ) : (
                      <>
                        <PlusIcon className="mr-2 h-4 w-4" /> Create Invoice
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 