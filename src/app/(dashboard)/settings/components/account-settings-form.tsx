"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  accountSettingsSchema,
  type AccountSettingsValues,
  type AccountSettingsDB,
} from "@/lib/validations/settings";

interface AccountSettingsFormProps {
  data: AccountSettingsDB | null | undefined;
  onSubmit: (data: AccountSettingsValues) => Promise<any>;
  isLoading: boolean;
}

export function AccountSettingsForm({
  data,
  onSubmit,
  isLoading,
}: AccountSettingsFormProps) {
  const form = useForm<AccountSettingsValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      businessName: data?.businessName || "",
      phoneNumber: data?.phoneNumber || "",
    },
  });

  const handleSubmit = async (values: AccountSettingsValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your Business Name"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                This will appear on your invoices and emails
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 (555) 123-4567"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Your business contact number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Account Settings
        </Button>
      </form>
    </Form>
  );
}
