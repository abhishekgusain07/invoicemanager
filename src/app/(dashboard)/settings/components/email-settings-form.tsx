"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { emailSettingsSchema, type EmailSettingsValues, type EmailSettingsDB } from "@/lib/validations/settings";

interface EmailSettingsFormProps {
  data: EmailSettingsDB | null | undefined;
  onSubmit: (data: EmailSettingsValues) => Promise<any>;
  isLoading: boolean;
}

export function EmailSettingsForm({ data, onSubmit, isLoading }: EmailSettingsFormProps) {
  const form = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      fromName: data?.fromName ?? "",
      emailSignature: data?.emailSignature ?? "Best regards,",
      defaultCC: data?.defaultCC ?? "",
      defaultBCC: data?.defaultBCC ?? "",
      previewEmails: data?.previewEmails ?? true,
      ccAccountant: data?.ccAccountant ?? false,
      useBrandedEmails: data?.useBrandedEmails ?? false,
      sendCopyToSelf: data?.sendCopyToSelf ?? false,
    },
  });

  const handleSubmit = async (values: EmailSettingsValues) => {
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
          name="fromName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your Name or Business Name" 
                  {...field} 
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                The name that appears in the "From" field of your emails
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailSignature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Signature</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Best regards,&#10;Your Name"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your default email signature for all outgoing emails
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defaultCC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default CC</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="cc@example.com" 
                    {...field} 
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Always CC this email address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defaultBCC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default BCC</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="bcc@example.com" 
                    {...field} 
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Always BCC this email address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Email Preferences</h3>
          
          <FormField
            control={form.control}
            name="previewEmails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Preview Emails</FormLabel>
                  <FormDescription>
                    Show a preview before sending emails
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ccAccountant"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">CC Accountant</FormLabel>
                  <FormDescription>
                    Copy your accountant on all payment reminders
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="useBrandedEmails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Use Branded Emails</FormLabel>
                  <FormDescription>
                    Include your business branding in emails
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sendCopyToSelf"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Send Copy to Self</FormLabel>
                  <FormDescription>
                    Receive a copy of all sent emails
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Email Settings
        </Button>
      </form>
    </Form>
  );
}