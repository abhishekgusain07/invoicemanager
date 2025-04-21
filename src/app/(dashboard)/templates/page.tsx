"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, MessageSquareIcon, RefreshCwIcon } from "lucide-react";
import { TemplateList } from "./components/template-list";
import { TemplateForm } from "./components/template-form";
import { TemplatePlaceholders } from "./components/template-placeholders";
import { getTemplates } from "@/actions/templates";
import { EmailTemplate } from "@/lib/validations/email-template";
import { toast } from "sonner";

export default function TemplatesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | undefined>(undefined);

  // Fetch templates when the page loads
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await getTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      } else {
        toast.error(result.error || "Failed to load templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("An error occurred while loading templates");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Reminder Templates</h2>
          <p className="text-muted-foreground">
            Customize how your reminder emails will be sent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={fetchTemplates}
            disabled={isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenTemplateForm} className="gap-2">
            <PlusIcon className="h-4 w-4" /> New Template
          </Button>
        </div>
      </div>

      {/* Template Form Dialog */}
      <Dialog open={isTemplateFormOpen} onOpenChange={setIsTemplateFormOpen}>
        <DialogContent className="w-[75vw] max-w-none p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{editTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4"></div>
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
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