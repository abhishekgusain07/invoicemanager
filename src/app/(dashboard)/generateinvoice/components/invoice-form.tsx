"use client";

import {
  invoiceGenerationSchema,
  invoiceGenerationItemSchema,
  PDF_DATA_LOCAL_STORAGE_KEY,
  type InvoiceGenerationData,
  type InvoiceGenerationItemData,
  SUPPORTED_LANGUAGES,
  LANGUAGE_TO_LABEL,
  SUPPORTED_CURRENCIES,
  CURRENCY_TO_LABEL,
  SUPPORTED_DATE_FORMATS,
  type InvoiceGenerationSellerData,
  type InvoiceGenerationBuyerData,
} from "@/lib/validations/invoice-generation";

import InvoiceTabs from "@/components/InvoiceTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReadOnlyMoneyInput } from "@/components/ui/money-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod";

import { DEBOUNCE_TIMEOUT } from "../constants";
import type { Prettify, NonReadonly } from "@/types/invoice-generation";
import { SellerBuyerManagement } from "./seller-buyer-management";

interface InvoiceFormProps {
  invoiceData: InvoiceGenerationData;
  onInvoiceDataChange: (updatedData: InvoiceGenerationData) => void;
  setCanShareInvoice: (canShareInvoice: boolean) => void;
}

export const InvoiceForm = memo(function InvoiceForm({
  invoiceData,
  onInvoiceDataChange,
  setCanShareInvoice,
}: InvoiceFormProps) {
  const form = useForm<InvoiceGenerationData>({
    resolver: zodResolver(invoiceGenerationSchema) as any,
    defaultValues: {
      ...invoiceData,
      language: invoiceData.language || "en",
      dateFormat: invoiceData.dateFormat || "YYYY-MM-DD",
      currency: invoiceData.currency || "EUR",
    },
    mode: "onChange",
  });

  // Reset form when invoice data changes (from store or external sources)
  useEffect(() => {
    form.reset({
      ...invoiceData,
      language: invoiceData.language || "en",
      dateFormat: invoiceData.dateFormat || "YYYY-MM-DD",
      currency: invoiceData.currency || "EUR",
    });
  }, [invoiceData, form]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = form;

  const currency = useWatch({ control, name: "currency" });
  const invoiceItems = useWatch({ control, name: "items" });
  const dateOfIssue = useWatch({ control, name: "dateOfIssue" });
  const paymentDue = useWatch({ control, name: "paymentDue" });
  const language = useWatch({ control, name: "language" });
  const selectedDateFormat = useWatch({ control, name: "dateFormat" });

  const isPaymentDueBeforeDateOfIssue = dayjs(paymentDue).isBefore(
    dayjs(dateOfIssue)
  );

  const isPaymentDue14DaysFromDateOfIssue =
    dayjs(paymentDue).isAfter(dayjs(dateOfIssue).add(14, "days")) ||
    dayjs(paymentDue).isSame(dayjs(dateOfIssue).add(14, "days"));

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Calculate totals and other values when invoice items change
  useEffect(() => {
    const validatedItems = z
      .array(invoiceGenerationItemSchema)
      .safeParse(invoiceItems);

    if (!validatedItems.success) {
      console.error("Invalid items:", validatedItems.error);
      return;
    }

    const total = invoiceItems?.length
      ? Number(
          invoiceItems
            .reduce((sum, item) => sum + (item?.preTaxAmount || 0), 0)
            .toFixed(2)
        )
      : 0;

    setValue("total", total, { shouldValidate: true });

    if (!invoiceItems?.length) return;

    const hasChanges = invoiceItems.some((item) => {
      const calculated = calculateItemTotals(item);
      return (
        calculated?.netAmount !== item.netAmount ||
        calculated?.vatAmount !== item.vatAmount ||
        calculated?.preTaxAmount !== item.preTaxAmount
      );
    });
    if (!hasChanges) return;

    const updatedItems = invoiceItems
      .map(calculateItemTotals)
      .filter(Boolean) as InvoiceGenerationItemData[];

    updatedItems.forEach((item, index) => {
      setValue(`items.${index}`, item, {
        shouldValidate: false,
      });
    });
  }, [invoiceItems, setValue]);

  // Regenerate PDF on every input change with debounce
  const debouncedRegeneratePdfOnFormChange = useDebouncedCallback(
    (data: InvoiceGenerationData) => {
      try {
        // Always call onSubmit to update the PDF preview, even with validation errors
        onSubmit(data);
      } catch (error) {
        console.error("Error in form change handler:", error);
      }
    },
    DEBOUNCE_TIMEOUT
  );

  // Subscribe to form changes to regenerate PDF on every input change
  useEffect(() => {
    const subscription = watch((value) => {
      debouncedRegeneratePdfOnFormChange(
        value as unknown as InvoiceGenerationData
      );
    });

    return () => subscription.unsubscribe();
  }, [debouncedRegeneratePdfOnFormChange, watch]);

  const template = useWatch({ control, name: "template" });
  const logo = useWatch({ control, name: "logo" });

  // Disable sharing when Stripe template contains a logo
  useEffect(() => {
    const canShareInvoice = !(template === "stripe" && Boolean(logo));
    setCanShareInvoice(canShareInvoice);
  }, [template, logo, setCanShareInvoice]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      remove(index);
      const currentFormData = watch();
      debouncedRegeneratePdfOnFormChange(currentFormData);
    },
    [remove, watch, debouncedRegeneratePdfOnFormChange]
  );

  const onSubmit = (data: InvoiceGenerationData) => {
    try {
      onInvoiceDataChange(data);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      // Don't show toast for every form change - only for critical errors
    }
  };

  // Define tab content components
  const GeneralTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="language">Language</Label>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {LANGUAGE_TO_LABEL[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr} - {CURRENCY_TO_LABEL[curr]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="dateFormat">Date Format</Label>
        <Controller
          name="dateFormat"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_DATE_FORMATS.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format} - {dayjs().format(format)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <Label htmlFor="invoiceNumber">Invoice Number</Label>
        <Input
          {...form.register("invoiceNumberObject.value")}
          id="invoiceNumber"
          placeholder="INV-001"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfIssue">Date of Issue</Label>
          <Input
            {...form.register("dateOfIssue")}
            id="dateOfIssue"
            type="date"
          />
        </div>

        <div>
          <Label htmlFor="dateOfService">Date of Service</Label>
          <Input
            {...form.register("dateOfService")}
            id="dateOfService"
            type="date"
          />
        </div>
      </div>
    </div>
  );

  const SellerTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Seller Information</h3>
        <SellerBuyerManagement
          type="seller"
          onSelect={(data) => {
            const sellerData = data as InvoiceGenerationSellerData;
            setValue("seller.name", sellerData.name);
            setValue("seller.address", sellerData.address);
            setValue("seller.email", sellerData.email);
            setValue("seller.vatNo", sellerData.vatNo || "");
            setValue("seller.accountNumber", sellerData.accountNumber || "");
            setValue("seller.swiftBic", sellerData.swiftBic || "");
            setValue("seller.notes", sellerData.notes || "");
          }}
          currentData={invoiceData.seller}
        />
      </div>
      
      <div>
        <Label htmlFor="sellerName">Seller Name *</Label>
        <Input
          {...form.register("seller.name")}
          id="sellerName"
          placeholder="Your Company Name"
        />
        {errors.seller?.name && (
          <p className="text-sm text-red-600 mt-1">
            {errors.seller.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="sellerAddress">Seller Address *</Label>
        <Textarea
          {...form.register("seller.address")}
          id="sellerAddress"
          placeholder="123 Business St, City, Country"
          rows={3}
        />
        {errors.seller?.address && (
          <p className="text-sm text-red-600 mt-1">
            {errors.seller.address.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="sellerEmail">Seller Email *</Label>
        <Input
          {...form.register("seller.email")}
          id="sellerEmail"
          type="email"
          placeholder="contact@company.com"
        />
        {errors.seller?.email && (
          <p className="text-sm text-red-600 mt-1">
            {errors.seller.email.message}
          </p>
        )}
      </div>
    </div>
  );

  const BuyerTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Buyer Information</h3>
        <SellerBuyerManagement
          type="buyer"
          onSelect={(data) => {
            const buyerData = data as InvoiceGenerationBuyerData;
            setValue("buyer.name", buyerData.name);
            setValue("buyer.address", buyerData.address);
            setValue("buyer.email", buyerData.email);
            setValue("buyer.vatNo", buyerData.vatNo || "");
            setValue("buyer.notes", buyerData.notes || "");
          }}
          currentData={invoiceData.buyer}
        />
      </div>

      <div>
        <Label htmlFor="buyerName">Buyer Name *</Label>
        <Input
          {...form.register("buyer.name")}
          id="buyerName"
          placeholder="Client Company Name"
        />
        {errors.buyer?.name && (
          <p className="text-sm text-red-600 mt-1">
            {errors.buyer.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="buyerAddress">Buyer Address *</Label>
        <Textarea
          {...form.register("buyer.address")}
          id="buyerAddress"
          placeholder="456 Client Ave, City, Country"
          rows={3}
        />
        {errors.buyer?.address && (
          <p className="text-sm text-red-600 mt-1">
            {errors.buyer.address.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="buyerEmail">Buyer Email *</Label>
        <Input
          {...form.register("buyer.email")}
          id="buyerEmail"
          type="email"
          placeholder="client@company.com"
        />
        {errors.buyer?.email && (
          <p className="text-sm text-red-600 mt-1">
            {errors.buyer.email.message}
          </p>
        )}
      </div>
    </div>
  );

  const ItemsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
      
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border rounded-lg p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Item {index + 1}</h4>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemoveItem(index)}
              >
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`item-${index}-name`}>
                Item Name *
              </Label>
              <Input
                {...form.register(`items.${index}.name`)}
                id={`item-${index}-name`}
                placeholder="Service or product name"
              />
            </div>

            <div>
              <Label htmlFor={`item-${index}-amount`}>Amount *</Label>
              <Input
                {...form.register(`items.${index}.amount`, { valueAsNumber: true })}
                id={`item-${index}-amount`}
                type="number"
                min="1"
                step="1"
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor={`item-${index}-netPrice`}>
                Net Price *
              </Label>
              <Input
                {...form.register(`items.${index}.netPrice`, { valueAsNumber: true })}
                id={`item-${index}-netPrice`}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor={`item-${index}-vat`}>VAT (%)</Label>
              <Input
                {...form.register(`items.${index}.vat`, { valueAsNumber: true })}
                id={`item-${index}-vat`}
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            invoiceItemNumberIsVisible: true,
            name: "",
            nameFieldIsVisible: true,
            typeOfGTU: "",
            typeOfGTUFieldIsVisible: true,
            amount: 1,
            amountFieldIsVisible: true,
            unit: "pcs",
            unitFieldIsVisible: true,
            netPrice: 0,
            netPriceFieldIsVisible: true,
            vat: 0,
            vatFieldIsVisible: true,
            netAmount: 0,
            netAmountFieldIsVisible: true,
            vatAmount: 0,
            vatAmountFieldIsVisible: true,
            preTaxAmount: 0,
            preTaxAmountFieldIsVisible: true,
          })
        }
      >
        Add Item
      </Button>

      {/* Additional payment and final fields */}
      <div className="border-t pt-6 space-y-4">
        <div>
          <Label htmlFor="total">Total</Label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <Controller
              name="total"
              control={control}
              render={({ field }) => (
                <ReadOnlyMoneyInput
                  {...field}
                  id="total"
                  currency={currency}
                  value={field.value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                />
              )}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Calculated automatically based on invoice items
          </p>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Input
            {...form.register("paymentMethod")}
            id="paymentMethod"
            placeholder="Bank Transfer, Credit Card, etc."
          />
        </div>

        <div>
          <Label htmlFor="paymentDue">Payment Due</Label>
          <Input
            {...form.register("paymentDue")}
            id="paymentDue"
            type="date"
          />
          {isPaymentDueBeforeDateOfIssue && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Payment due date is before date of issue
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            {...form.register("notes")}
            id="notes"
            rows={3}
            placeholder="Additional notes or terms..."
          />
        </div>
      </div>
    </div>
  );

  // Define tabs configuration
  const tabs = [
    {
      value: "general",
      label: "General",
      content: <GeneralTab />
    },
    {
      value: "seller",
      label: "Seller",
      content: <SellerTab />
    },
    {
      value: "buyer", 
      label: "Buyer",
      content: <BuyerTab />
    },
    {
      value: "items",
      label: "Items",
      content: <ItemsTab />
    }
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <form
        className="mb-4 space-y-3.5"
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          // Only show validation errors when user explicitly submits, not during typing
        })}
      >
        <InvoiceTabs 
          defaultValue="general"
          tabs={tabs}
          className="w-full"
        />
        
        {/* Form Status Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <span>
            {Object.keys(errors).length > 0 ? (
              <span className="text-red-600">
                ⚠️ {Object.keys(errors).length} validation error(s)
              </span>
            ) : (
              <span className="text-green-600">✓ Form is valid</span>
            )}
          </span>
          <span>Changes are saved automatically</span>
        </div>
      </form>
    </TooltipProvider>
  );
});

const calculateItemTotals = (item: InvoiceGenerationItemData | null) => {
  if (!item) return null;

  const amount = Number(item.amount) || 0;
  const netPrice = Number(item.netPrice) || 0;
  const calculatedNetAmount = amount * netPrice;
  const formattedNetAmount = Number(calculatedNetAmount.toFixed(2));

  let vatAmount = 0;
  if (item.vat && item.vat !== "NP" && item.vat !== "OO") {
    vatAmount = (formattedNetAmount * Number(item.vat)) / 100;
  }

  const formattedVatAmount = Number(vatAmount.toFixed(2));
  const formattedPreTaxAmount = Number(
    (formattedNetAmount + formattedVatAmount).toFixed(2)
  );

  return {
    ...item,
    netAmount: formattedNetAmount,
    vatAmount: formattedVatAmount,
    preTaxAmount: formattedPreTaxAmount,
  };
};
