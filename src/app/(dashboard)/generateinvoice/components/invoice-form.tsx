"use client";

import {
  invoiceGenerationSchema,
  invoiceGenerationItemSchema,
  PDF_DATA_LOCAL_STORAGE_KEY,
  ACCORDION_STATE_LOCAL_STORAGE_KEY,
  accordionGenerationSchema,
  type InvoiceGenerationData,
  type InvoiceGenerationItemData,
  type AccordionGenerationState,
} from "@/lib/validations/invoice-generation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReadOnlyMoneyInput } from "@/components/ui/money-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod";

import { DEFAULT_ACCORDION_VALUES, DEBOUNCE_TIMEOUT } from "../constants";
import type { Prettify, NonReadonly } from "@/types/invoice-generation";

const ACCORDION_GENERAL = DEFAULT_ACCORDION_VALUES[0];
const ACCORDION_SELLER = DEFAULT_ACCORDION_VALUES[1];
const ACCORDION_BUYER = DEFAULT_ACCORDION_VALUES[2];
const ACCORDION_ITEMS = DEFAULT_ACCORDION_VALUES[3];

type AccordionKeys = Array<(typeof DEFAULT_ACCORDION_VALUES)[number]>;

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
    resolver: zodResolver(invoiceGenerationSchema),
    defaultValues: invoiceData,
    mode: "onChange",
  });

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
    const validatedItems = z.array(invoiceGenerationItemSchema).safeParse(invoiceItems);

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
      void handleSubmit(onSubmit)(data as unknown as React.BaseSyntheticEvent);

      try {
        const validatedData = invoiceGenerationSchema.parse(data);
        const stringifiedData = JSON.stringify(validatedData);
        localStorage.setItem(PDF_DATA_LOCAL_STORAGE_KEY, stringifiedData);
      } catch (error) {
        console.error("Error saving to local storage:", error);
      }
    },
    DEBOUNCE_TIMEOUT
  );

  // Subscribe to form changes to regenerate PDF on every input change
  useEffect(() => {
    const subscription = watch((value) => {
      debouncedRegeneratePdfOnFormChange(value as unknown as InvoiceGenerationData);
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
    onInvoiceDataChange(data);
  };

  const [accordionValues, setAccordionValues] = useState<
    Prettify<AccordionKeys>
  >(() => {
    try {
      const savedState = localStorage.getItem(ACCORDION_STATE_LOCAL_STORAGE_KEY);

      if (savedState) {
        const parsedState = JSON.parse(savedState) as AccordionGenerationState;
        const validatedState = accordionGenerationSchema.safeParse(parsedState);

        if (validatedState.success) {
          const arrayOfOpenSections = Object.entries(validatedState.data)
            .filter(([_, isOpen]) => isOpen)
            .map(([section]) => section) as Prettify<AccordionKeys>;

          return arrayOfOpenSections;
        }
      }
    } catch (error) {
      console.error("Error loading accordion state:", error);
    }

    return DEFAULT_ACCORDION_VALUES as NonReadonly<
      typeof DEFAULT_ACCORDION_VALUES
    >;
  });

  const handleAccordionValueChange = (value: Prettify<AccordionKeys>) => {
    setAccordionValues(value);

    try {
      const stateToSave = accordionGenerationSchema.parse({
        general: value.includes(ACCORDION_GENERAL),
        seller: value.includes(ACCORDION_SELLER),
        buyer: value.includes(ACCORDION_BUYER),
        invoiceItems: value.includes(ACCORDION_ITEMS),
      });

      localStorage.setItem(
        ACCORDION_STATE_LOCAL_STORAGE_KEY,
        JSON.stringify(stateToSave)
      );
    } catch (error) {
      console.error("Error saving accordion state:", error);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <form
        className="mb-4 space-y-3.5"
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          toast.error("Please fix the form validation errors");
        })}
      >
        <Accordion
          type="multiple"
          value={accordionValues}
          onValueChange={handleAccordionValueChange}
          className="space-y-4"
        >
          {/* General Information */}
          <AccordionItem
            value={ACCORDION_GENERAL}
            className="rounded-lg border shadow"
          >
            <AccordionTrigger className="px-4 py-3">
              <span className="font-semibold">General Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Controller
                    name="invoiceNumberObject.value"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="invoiceNumber"
                        placeholder="INV-001"
                      />
                    )}
                  />
                </div>

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
            </AccordionContent>
          </AccordionItem>

          {/* Seller Information */}
          <AccordionItem
            value={ACCORDION_SELLER}
            className="rounded-lg border shadow"
          >
            <AccordionTrigger className="px-4 py-3">
              <span className="font-semibold">Seller Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sellerName">Seller Name *</Label>
                  <Controller
                    name="seller.name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="sellerName"
                        placeholder="Your Company Name"
                      />
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
                  <Textarea
                    {...(form.register("seller.address"))}
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
            </AccordionContent>
          </AccordionItem>

          {/* Buyer Information */}
          <AccordionItem
            value={ACCORDION_BUYER}
            className="rounded-lg border shadow"
          >
            <AccordionTrigger className="px-4 py-3">
              <span className="font-semibold">Buyer Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
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
                  <Textarea
                    {...(form.register("buyer.address"))}
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
            </AccordionContent>
          </AccordionItem>

          {/* Invoice Items */}
          <AccordionItem
            value={ACCORDION_ITEMS}
            className="rounded-lg border shadow"
          >
            <AccordionTrigger className="px-4 py-3">
              <span className="font-semibold">Invoice Items</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
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
                  onClick={() => append({
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
                  })}
                >
                  Add Item
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Final section */}
        <div className="space-y-4">
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
            {isPaymentDueBeforeDateOfIssue && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Payment due date is before date of issue
              </p>
            )}
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