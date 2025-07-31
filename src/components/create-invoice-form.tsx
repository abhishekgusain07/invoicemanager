"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { PlusIcon, XIcon, CheckIcon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";
import { deepEqual } from "@/lib/utils";
import { api } from "@/lib/trpc";
import { useDebouncedCallback } from "use-debounce";

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

export function CreateInvoiceForm({
  onClose,
  initialData,
  isEditing = false,
}: CreateInvoiceFormProps) {
  const [originalValues, setOriginalValues] =
    useState<InvoiceFormValues | null>(null);
  const [invoiceNumberValidation, setInvoiceNumberValidation] = useState<{
    isChecking: boolean;
    isDuplicate: boolean;
    message?: string;
  }>({ isChecking: false, isDuplicate: false });
  
  // Draft key for localStorage
  const draftKey = `invoice-draft-${isEditing ? initialData?.id : 'new'}`;
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showQuickFill, setShowQuickFill] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<Array<{clientName: string, clientEmail: string}>>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // tRPC mutations with optimistic updates
  const utils = api.useUtils();
  const createInvoiceMutation = api.invoice.create.useMutation({
    onMutate: async (newInvoice) => {
      // Cancel any outgoing refetches
      await utils.invoice.getByStatus.cancel();
      await utils.dashboard.getAllDashboardData.cancel();

      // Snapshot the previous values
      const previousInvoices = utils.invoice.getByStatus.getData({ status: "all" });
      const previousDashboard = utils.dashboard.getAllDashboardData.getData();

      // Optimistically update the cache
      if (previousInvoices) {
        const optimisticInvoice = {
          id: `temp-${Date.now()}`, // Temporary ID
          userId: "current-user",
          clientName: newInvoice.clientName,
          clientEmail: newInvoice.clientEmail,
          invoiceNumber: newInvoice.invoiceNumber,
          amount: String(newInvoice.amount),
          currency: newInvoice.currency,
          issueDate: new Date(newInvoice.issueDate),
          dueDate: new Date(newInvoice.dueDate),
          description: newInvoice.description || "",
          additionalNotes: newInvoice.additionalNotes || "",
          status: "pending" as const,
          paymentDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        utils.invoice.getByStatus.setData(
          { status: "all" },
          [...previousInvoices, optimisticInvoice]
        );
        utils.invoice.getByStatus.setData(
          { status: "pending" },
          [...(utils.invoice.getByStatus.getData({ status: "pending" }) || []), optimisticInvoice]
        );
      }

      return { previousInvoices, previousDashboard };
    },
    onError: (err, newInvoice, context) => {
      // Revert optimistic updates on error
      if (context?.previousInvoices) {
        utils.invoice.getByStatus.setData({ status: "all" }, context.previousInvoices);
      }
      toast.error(err.message || "Failed to create invoice");
    },
    onSuccess: () => {
      toast.success("Invoice created successfully!");
      // Clear draft data on successful creation
      if (typeof window !== 'undefined') {
        localStorage.removeItem(draftKey);
      }
      onClose();
    },
    onSettled: () => {
      // Always refetch after mutation (success or error)
      utils.invoice.getByStatus.invalidate();
      utils.dashboard.getAllDashboardData.invalidate();
    },
  });

  const updateInvoiceMutation = api.invoice.update.useMutation({
    onMutate: async ({ id, data: updatedData }) => {
      // Cancel any outgoing refetches
      await utils.invoice.getByStatus.cancel();
      await utils.invoice.getById.cancel({ id });

      // Snapshot the previous values
      const previousInvoices = utils.invoice.getByStatus.getData({ status: "all" });
      const previousInvoice = utils.invoice.getById.getData({ id });

      // Optimistically update the cache
      if (previousInvoices) {
        const updatedInvoices = previousInvoices.map((invoice) =>
          invoice.id === id
            ? {
                ...invoice,
                clientName: updatedData.clientName,
                clientEmail: updatedData.clientEmail,
                invoiceNumber: updatedData.invoiceNumber,
                amount: String(updatedData.amount),
                currency: updatedData.currency,
                issueDate: new Date(updatedData.issueDate),
                dueDate: new Date(updatedData.dueDate),
                description: updatedData.description || "",
                additionalNotes: updatedData.additionalNotes || "",
                updatedAt: new Date(),
              }
            : invoice
        );
        utils.invoice.getByStatus.setData({ status: "all" }, updatedInvoices);
      }

      return { previousInvoices, previousInvoice };
    },
    onError: (err, { id }, context) => {
      // Revert optimistic updates on error  
      if (context?.previousInvoices) {
        utils.invoice.getByStatus.setData({ status: "all" }, context.previousInvoices);
      }
      if (context?.previousInvoice) {
        utils.invoice.getById.setData({ id }, context.previousInvoice);
      }
      toast.error(err.message || "Failed to update invoice");
    },
    onSuccess: () => {
      toast.success("Invoice updated successfully!");
      onClose();
    },
    onSettled: () => {
      // Always refetch after mutation (success or error)
      utils.invoice.getByStatus.invalidate();
      utils.invoice.getById.invalidate();
      utils.dashboard.getAllDashboardData.invalidate();
    },
  });

  const isSubmitting = createInvoiceMutation.isPending || updateInvoiceMutation.isPending;

  // Query for recent invoices to enable quick fill
  const recentInvoicesQuery = api.invoice.getAll.useQuery(
    { limit: 10, offset: 0 },
    { 
      enabled: !isEditing && showQuickFill,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Query for unique clients for smart suggestions
  const uniqueClientsQuery = api.invoice.getUniqueClients.useQuery(
    undefined,
    {
      enabled: !isEditing,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Format date for form input (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    return date instanceof Date
      ? date.toISOString().split("T")[0]
      : new Date(date).toISOString().split("T")[0];
  };

  // Get default values - memoize to prevent recreation on every render
  const defaultValues = useMemo(() => {
    // Check for cached draft data first (only for new invoices)
    if (!isEditing && typeof window !== 'undefined') {
      const cachedDraft = localStorage.getItem(draftKey);
      if (cachedDraft) {
        try {
          const parsedDraft = JSON.parse(cachedDraft);
          // Validate that the draft has required fields
          if (parsedDraft.clientName !== undefined) {
            return parsedDraft;
          }
        } catch (error) {
          console.warn('Invalid draft data, clearing cache:', error);
          localStorage.removeItem(draftKey);
        }
      }
    }

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
        additionalNotes: initialData.additionalNotes || "",
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
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      description: "",
      additionalNotes: "",
    };
  }, [initialData, isEditing, draftKey]);

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
  const currentInvoiceNumber = form.watch("invoiceNumber");
  const currentClientName = form.watch("clientName");

  // Debounced invoice number validation
  const debouncedValidateInvoiceNumber = useDebouncedCallback(
    async (invoiceNumber: string) => {
      if (!invoiceNumber.trim()) {
        setInvoiceNumberValidation({ isChecking: false, isDuplicate: false });
        return;
      }

      setInvoiceNumberValidation({ isChecking: true, isDuplicate: false });

      try {
        const result = await utils.client.invoice.checkInvoiceNumber.query({
          invoiceNumber,
          excludeId: isEditing ? initialData?.id : undefined,
        });

        setInvoiceNumberValidation({
          isChecking: false,
          isDuplicate: result.exists,
          message: result.exists 
            ? "Invoice number already exists" 
            : "Invoice number is available",
        });
      } catch (error) {
        setInvoiceNumberValidation({
          isChecking: false,
          isDuplicate: false,
          message: "Unable to validate invoice number",
        });
      }
    },
    500
  );

  // Effect to validate invoice number on change
  useEffect(() => {
    if (currentInvoiceNumber && currentInvoiceNumber !== defaultValues.invoiceNumber) {
      debouncedValidateInvoiceNumber(currentInvoiceNumber);
    }
  }, [currentInvoiceNumber, debouncedValidateInvoiceNumber, defaultValues.invoiceNumber]);

  // Debounced auto-save for draft data
  const debouncedSaveDraft = useDebouncedCallback(
    (formData: InvoiceFormValues) => {
      if (!isEditing && typeof window !== 'undefined') {
        try {
          localStorage.setItem(draftKey, JSON.stringify(formData));
          setLastSaved(new Date());
        } catch (error) {
          console.warn('Failed to save draft:', error);
        }
      }
    },
    1000 // Save after 1 second of no changes
  );

  // Auto-save effect
  useEffect(() => {
    // Only auto-save for new invoices and if form has meaningful data
    if (!isEditing && (formValues.clientName || formValues.clientEmail || formValues.description)) {
      debouncedSaveDraft(formValues);
    }
  }, [formValues, isEditing, debouncedSaveDraft]);

  // Filter client suggestions based on current input
  useEffect(() => {
    if (!isEditing && uniqueClientsQuery.data && currentClientName.length > 0) {
      const filtered = uniqueClientsQuery.data.filter(client => 
        client.clientName.toLowerCase().includes(currentClientName.toLowerCase()) ||
        client.clientEmail.toLowerCase().includes(currentClientName.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      setClientSuggestions(filtered);
      setShowClientSuggestions(filtered.length > 0 && currentClientName.length >= 2);
    } else {
      setShowClientSuggestions(false);
    }
  }, [currentClientName, uniqueClientsQuery.data, isEditing]);

  const hasChanges = useMemo(() => {
    return isEditing && originalValues
      ? !deepEqual(originalValues, formValues)
      : true;
  }, [isEditing, originalValues, formValues]);

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      if (isEditing && initialData) {
        await updateInvoiceMutation.mutateAsync({
          id: initialData.id,
          data,
        });
      } else {
        await createInvoiceMutation.mutateAsync(data);
      }
    } catch (error) {
      // Error handling is done in the mutation onError callbacks
      console.error(
        isEditing ? "Error updating invoice:" : "Error creating invoice:",
        error
      );
    }
  };

  // Quick fill from existing invoice
  const handleQuickFill = (invoice: any) => {
    form.setValue("clientName", invoice.clientName);
    form.setValue("clientEmail", invoice.clientEmail);
    form.setValue("currency", invoice.currency);
    form.setValue("description", invoice.description || "");
    form.setValue("additionalNotes", invoice.additionalNotes || "");
    
    // Generate new invoice number and dates
    form.setValue("invoiceNumber", `INV-${Math.floor(100000 + Math.random() * 900000)}`);
    form.setValue("issueDate", new Date().toISOString().split("T")[0]);
    form.setValue("dueDate", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    
    setShowQuickFill(false);
    toast.success("Invoice details filled from template");
  };

  // Handle client suggestion selection
  const handleClientSuggestion = (client: {clientName: string, clientEmail: string}) => {
    form.setValue("clientName", client.clientName);
    form.setValue("clientEmail", client.clientEmail);
    setShowClientSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              {isEditing ? "Edit Invoice" : "Create New Invoice"}
            </h2>
            {!isEditing && lastSaved && (
              <p className="text-xs text-muted-foreground mt-1">
                Draft saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQuickFill(!showQuickFill)}
              >
                Quick Fill
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isEditing && showQuickFill && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-sm font-medium mb-3">Fill from recent invoice:</h3>
            {recentInvoicesQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Loading recent invoices...
              </div>
            ) : recentInvoicesQuery.data && recentInvoicesQuery.data.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recentInvoicesQuery.data.map((invoice) => (
                  <button
                    key={invoice.id}
                    type="button"
                    onClick={() => handleQuickFill(invoice)}
                    className="w-full text-left p-2 rounded hover:bg-background border text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{invoice.clientName}</div>
                        <div className="text-muted-foreground text-xs">
                          {invoice.invoiceNumber} • {invoice.currency} {invoice.amount}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent invoices found</p>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter client name" 
                        {...field} 
                        onFocus={() => {
                          if (!isEditing && uniqueClientsQuery.data && field.value.length >= 2) {
                            const filtered = uniqueClientsQuery.data.filter(client => 
                              client.clientName.toLowerCase().includes(field.value.toLowerCase()) ||
                              client.clientEmail.toLowerCase().includes(field.value.toLowerCase())
                            ).slice(0, 5);
                            if (filtered.length > 0) {
                              setClientSuggestions(filtered);
                              setShowClientSuggestions(true);
                            }
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding suggestions to allow for clicks
                          setTimeout(() => setShowClientSuggestions(false), 200);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {showClientSuggestions && clientSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg">
                        <div className="max-h-48 overflow-y-auto">
                          {clientSuggestions.map((client, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleClientSuggestion(client)}
                              className="w-full text-left px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none text-sm"
                            >
                              <div className="font-medium">{client.clientName}</div>
                              <div className="text-xs text-muted-foreground">{client.clientEmail}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                      <div className="relative">
                        <Input 
                          placeholder="INV-123456" 
                          {...field}
                          className={`pr-10 ${
                            invoiceNumberValidation.isDuplicate 
                              ? "border-red-500 focus:border-red-500" 
                              : invoiceNumberValidation.message && !invoiceNumberValidation.isDuplicate
                              ? "border-green-500 focus:border-green-500"
                              : ""
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {invoiceNumberValidation.isChecking && (
                            <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {!invoiceNumberValidation.isChecking && invoiceNumberValidation.isDuplicate && (
                            <AlertCircleIcon className="h-4 w-4 text-red-500" />
                          )}
                          {!invoiceNumberValidation.isChecking && 
                           invoiceNumberValidation.message && 
                           !invoiceNumberValidation.isDuplicate && (
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {invoiceNumberValidation.message && (
                      <p className={`text-sm mt-1 ${
                        invoiceNumberValidation.isDuplicate 
                          ? "text-red-600" 
                          : "text-green-600"
                      }`}>
                        {invoiceNumberValidation.message}
                      </p>
                    )}
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
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
              <Button
                type="submit"
                disabled={
                  isSubmitting || 
                  (isEditing && !hasChanges) || 
                  invoiceNumberValidation.isDuplicate ||
                  invoiceNumberValidation.isChecking
                }
              >
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
