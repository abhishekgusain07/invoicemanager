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
  invoiceData?: InvoiceGenerationData; // Optional for initial load
  onInvoiceDataChange: (updatedData: InvoiceGenerationData) => void;
  setCanShareInvoice: (canShareInvoice: boolean) => void;
  onFormReset?: (resetFn: (data: InvoiceGenerationData) => void) => void; // For loading saved invoices
  onFormDataGetter?: (getterFn: () => InvoiceGenerationData) => void; // For manual preview updates
}

export const InvoiceForm = memo(function InvoiceForm({
  invoiceData,
  onInvoiceDataChange,
  setCanShareInvoice,
  onFormReset,
  onFormDataGetter,
}: InvoiceFormProps) {
  const form = useForm<InvoiceGenerationData>({
    resolver: zodResolver(invoiceGenerationSchema) as any,
    defaultValues: invoiceData || {
      language: "en",
      dateFormat: "YYYY-MM-DD",
      currency: "EUR",
      template: "default",
      logo: "",
      invoiceNumberObject: {
        label: "Invoice Number:",
        value: "INV-001",
      },
      dateOfIssue: dayjs().format("YYYY-MM-DD"),
      dateOfService: dayjs().endOf("month").format("YYYY-MM-DD"),
      invoiceType: "Invoice",
      invoiceTypeFieldIsVisible: true,
      seller: {
        name: "",
        address: "",
        vatNo: "",
        vatNoFieldIsVisible: true,
        email: "",
        accountNumber: "",
        accountNumberFieldIsVisible: true,
        swiftBic: "",
        swiftBicFieldIsVisible: true,
        notes: "",
        notesFieldIsVisible: true,
      },
      buyer: {
        name: "",
        address: "",
        vatNo: "",
        vatNoFieldIsVisible: true,
        email: "",
        notes: "",
        notesFieldIsVisible: true,
      },
      items: [
        {
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
        },
      ],
      total: 0,
      vatTableSummaryIsVisible: true,
      paymentMethod: "",
      paymentMethodFieldIsVisible: true,
      paymentDue: dayjs().add(14, "days").format("YYYY-MM-DD"),
      stripePayOnlineUrl: "",
      notes: "",
      notesFieldIsVisible: true,
      personAuthorizedToReceiveFieldIsVisible: true,
      personAuthorizedToIssueFieldIsVisible: true,
    },
    mode: "onChange",
  });

  // Only reset form when explicitly loading saved data (not on every change)
  const resetFormWithData = useCallback(
    (data: InvoiceGenerationData) => {
      form.reset(data);
    },
    [form]
  );

  // Expose reset function to parent component for loading saved invoices
  useEffect(() => {
    if (onFormReset) {
      onFormReset(resetFormWithData);
    }
  }, [onFormReset, resetFormWithData]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = form;

  // Expose form data getter to parent component for manual preview updates
  const getFormData = useCallback(() => {
    const formData = watch();
    return formData as InvoiceGenerationData;
  }, [watch]);

  useEffect(() => {
    if (onFormDataGetter) {
      onFormDataGetter(getFormData);
    }
  }, [onFormDataGetter, getFormData]);

  // NO watchers - form is now pure input handler for smooth typing

  // Date validation logic moved to parent component (no more watchers needed)

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Item calculations moved to parent component - no more automatic calculations during typing

  // No automatic store updates - only manual via button click

  // Sharing logic moved to parent component

  const handleRemoveItem = useCallback(
    (index: number) => {
      remove(index);
      // Form values will automatically update and trigger preview update
    },
    [remove]
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
              <Select onValueChange={field.onChange} value={field.value}>
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
              <Select onValueChange={field.onChange} value={field.value}>
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
            <Select onValueChange={field.onChange} value={field.value}>
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
        <Controller
          name="invoiceNumberObject.value"
          control={control}
          render={({ field }) => (
            <Input {...field} id="invoiceNumber" placeholder="INV-001" />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfIssue">Date of Issue</Label>
          <Controller
            name="dateOfIssue"
            control={control}
            render={({ field }) => (
              <Input {...field} id="dateOfIssue" type="date" />
            )}
          />
        </div>

        <div>
          <Label htmlFor="dateOfService">Date of Service</Label>
          <Controller
            name="dateOfService"
            control={control}
            render={({ field }) => (
              <Input {...field} id="dateOfService" type="date" />
            )}
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
          currentData={invoiceData?.seller}
        />
      </div>

      <div>
        <Label htmlFor="sellerName">Seller Name *</Label>
        <Controller
          name="seller.name"
          control={control}
          render={({ field }) => (
            <Input {...field} id="sellerName" placeholder="Your Company Name" />
          )}
        />
        {errors.seller?.name && (
          <p className="text-sm text-red-600 mt-1">
            {errors.seller.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="sellerAddress">Seller Address *</Label>
        <Controller
          name="seller.address"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="sellerAddress"
              placeholder="123 Business St, City, Country"
              rows={3}
            />
          )}
        />
        {errors.seller?.address && (
          <p className="text-sm text-red-600 mt-1">
            {errors.seller.address.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="sellerEmail">Seller Email *</Label>
        <Controller
          name="seller.email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="sellerEmail"
              type="email"
              placeholder="contact@company.com"
            />
          )}
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
          currentData={invoiceData?.buyer}
        />
      </div>

      <div>
        <Label htmlFor="buyerName">Buyer Name *</Label>
        <Controller
          name="buyer.name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="buyerName"
              placeholder="Client Company Name"
            />
          )}
        />
        {errors.buyer?.name && (
          <p className="text-sm text-red-600 mt-1">
            {errors.buyer.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="buyerAddress">Buyer Address *</Label>
        <Controller
          name="buyer.address"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="buyerAddress"
              placeholder="456 Client Ave, City, Country"
              rows={3}
            />
          )}
        />
        {errors.buyer?.address && (
          <p className="text-sm text-red-600 mt-1">
            {errors.buyer.address.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="buyerEmail">Buyer Email *</Label>
        <Controller
          name="buyer.email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="buyerEmail"
              type="email"
              placeholder="client@company.com"
            />
          )}
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
        <div key={field.id} className="border rounded-lg p-4 space-y-4">
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
              <Label htmlFor={`item-${index}-name`}>Item Name *</Label>
              <Controller
                name={`items.${index}.name`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id={`item-${index}-name`}
                    placeholder="Service or product name"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor={`item-${index}-amount`}>Amount *</Label>
              <Controller
                name={`items.${index}.amount`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                    id={`item-${index}-amount`}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor={`item-${index}-netPrice`}>Net Price *</Label>
              <Controller
                name={`items.${index}.netPrice`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                    id={`item-${index}-netPrice`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor={`item-${index}-vat`}>VAT (%)</Label>
              <Controller
                name={`items.${index}.vat`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                    id={`item-${index}-vat`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                  />
                )}
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
                  currency="EUR"
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
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="paymentMethod"
                placeholder="Bank Transfer, Credit Card, etc."
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="paymentDue">Payment Due</Label>
          <Controller
            name="paymentDue"
            control={control}
            render={({ field }) => (
              <Input {...field} id="paymentDue" type="date" />
            )}
          />
          {/* Date validation moved to manual update - no more real-time validation */}
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="notes"
                rows={3}
                placeholder="Additional notes or terms..."
              />
            )}
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
      content: <GeneralTab />,
    },
    {
      value: "seller",
      label: "Seller",
      content: <SellerTab />,
    },
    {
      value: "buyer",
      label: "Buyer",
      content: <BuyerTab />,
    },
    {
      value: "items",
      label: "Items",
      content: <ItemsTab />,
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <form
        className="mb-4 space-y-3.5"
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
        })}
      >
        <InvoiceTabs defaultValue="general" tabs={tabs} className="w-full" />

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
