"use client";

import { Card, CardContent } from "@/components/ui/card";
import { HelpCircleIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

export function TemplatePlaceholders() {
  const placeholders = [
    {
      name: "client_name",
      description: "Will be replaced with the client's name"
    },
    {
      name: "invoice_number",
      description: "Will be replaced with the invoice number"
    },
    {
      name: "invoice_amount",
      description: "Will be replaced with the formatted invoice amount (including currency)"
    },
    {
      name: "due_date",
      description: "Will be replaced with the invoice due date"
    },
    {
      name: "days_overdue",
      description: "Will be replaced with the number of days the invoice is overdue"
    },
    {
      name: "invoice_link",
      description: "Will be replaced with a link to view the invoice"
    },
    {
      name: "sender_name",
      description: "Will be replaced with your name"
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Template Placeholders</h3>
          <Tooltip content="Use these placeholders in your templates to automatically insert invoice and client information">
            <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Use these placeholders in your templates to automatically personalize your emails
        </p>
        
        <div className="space-y-3">
          {placeholders.map((placeholder) => (
            <div key={placeholder.name} className="flex items-start gap-2">
              <div className="bg-primary/10 text-primary font-mono rounded-md px-2 py-1 text-sm">
                {`{${placeholder.name}}`}
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                {placeholder.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
          <p className="mb-2">Examples:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">Subject:</span> Payment Reminder: Invoice #{'{invoice_number}'} is Overdue
            </li>
            <li>
              <span className="font-medium">Content:</span> Dear {'{client_name}'}, your invoice for {'{invoice_amount}'} was due on {'{due_date}'}.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 