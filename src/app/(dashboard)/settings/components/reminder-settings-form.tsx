"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { reminderSettingsSchema, type ReminderSettingsValues, type ReminderSettingsDB } from "@/lib/validations/settings";

interface ReminderSettingsFormProps {
  data: ReminderSettingsDB | null | undefined;
  onSubmit: (data: ReminderSettingsValues) => Promise<any>;
  isLoading: boolean;
}

const toneOptions = [
  { value: "polite", label: "Polite" },
  { value: "friendly", label: "Friendly" },
  { value: "neutral", label: "Neutral" },
  { value: "firm", label: "Firm" },
  { value: "direct", label: "Direct" },
  { value: "assertive", label: "Assertive" },
  { value: "urgent", label: "Urgent" },
  { value: "final", label: "Final" },
  { value: "serious", label: "Serious" },
] as const;

export function ReminderSettingsForm({ data, onSubmit, isLoading }: ReminderSettingsFormProps) {
  const form = useForm<ReminderSettingsValues>({
    resolver: zodResolver(reminderSettingsSchema),
    defaultValues: {
      isAutomatedReminders: data?.isAutomatedReminders ?? true,
      firstReminderDays: data?.firstReminderDays ?? 3,
      followUpFrequency: data?.followUpFrequency ?? 7,
      maxReminders: data?.maxReminders ?? 3,
      firstReminderTone: data?.firstReminderTone ?? "polite",
      secondReminderTone: data?.secondReminderTone ?? "firm",
      thirdReminderTone: data?.thirdReminderTone ?? "urgent",
    },
  });

  const handleSubmit = async (values: ReminderSettingsValues) => {
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
          name="isAutomatedReminders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Automated Reminders</FormLabel>
                <FormDescription>
                  Automatically send payment reminders to clients
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="firstReminderDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Reminder (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Days after due date</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="followUpFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-up Frequency (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Days between reminders</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxReminders"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Reminders</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Total reminder limit</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Reminder Tones</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="firstReminderTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Reminder Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondReminderTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second Reminder Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thirdReminderTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Third Reminder Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Reminder Settings
        </Button>
      </form>
    </Form>
  );
}