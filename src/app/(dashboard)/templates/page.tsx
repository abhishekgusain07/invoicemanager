"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, MessageSquareIcon, RefreshCwIcon } from "lucide-react";
import { TemplateList } from "./components/template-list";
import { TemplateForm } from "./components/template-form";
import { TemplatePlaceholders } from "./components/template-placeholders";
import { TemplateListSkeleton } from "./components/template-list-skeleton";
import { api } from "@/lib/trpc";
import { EmailTemplate } from "@/lib/validations/email-template";
import { toast } from "sonner";

export default function TemplatesPage() {
  // tRPC query for templates
  const {
    data: templatesResponse,
    isLoading,
    refetch: fetchTemplates,
    error,
  } = api.templates.getAll.useQuery();

  const templates = templatesResponse?.data ?? [];

  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | undefined>(
    undefined
  );

  // Show error toast if query fails
  if (error) {
    toast.error("Failed to load templates");
  }

  const handleOpenTemplateForm = () => {
    setEditTemplate(undefined); // Reset edit template
    setIsTemplateFormOpen(true);
  };

  const handleCloseTemplateForm = () => {
    setIsTemplateFormOpen(false);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Reminder Templates
          </h2>
          <p className="text-muted-foreground">
            Customize how your reminder emails will be sent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fetchTemplates()}
            disabled={isLoading}
          >
            <RefreshCwIcon
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleOpenTemplateForm} className="gap-2">
            <PlusIcon className="h-4 w-4" /> New Template
          </Button>
        </div>
      </div>

      {/* Template Form Dialog */}
      <Dialog open={isTemplateFormOpen} onOpenChange={setIsTemplateFormOpen}>
        <DialogContent
          className="p-0 border-0 bg-transparent shadow-none"
          style={{
            width: "95vw",
            height: "95vh",
            maxWidth: "none",
            maxHeight: "none",
          }}
        >
          <TemplateForm
            template={editTemplate}
            onCancel={handleCloseTemplateForm}
          />
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {isLoading ? (
            <TemplateListSkeleton />
          ) : (
            <TemplateList
              templates={templates}
              onCreateTemplate={handleOpenTemplateForm}
            />
          )}
        </div>

        <div className="md:col-span-1">
          <TemplatePlaceholders />
        </div>
      </div>
    </div>
  );
}
