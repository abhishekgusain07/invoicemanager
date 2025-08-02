"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmailTemplate } from "@/lib/validations/email-template";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type ToneType =
  | "polite"
  | "friendly"
  | "neutral"
  | "firm"
  | "direct"
  | "assertive"
  | "urgent"
  | "final"
  | "serious";

interface TemplateSelectorProps {
  tone: ToneType;
  value: string;
  onChange: (value: string) => void;
  onCreateNew?: () => void;
}

export function TemplateSelector({
  tone,
  value,
  onChange,
  onCreateNew,
}: TemplateSelectorProps) {
  const router = useRouter();

  // tRPC query for templates by tone
  const {
    data: templatesResponse,
    isLoading,
    refetch: fetchTemplates,
    error,
  } = api.templates.getByTone.useQuery({ tone });

  const templates = templatesResponse?.data ?? [];

  // Show error toast if query fails
  if (error) {
    toast.error("Failed to load templates");
  }

  // Auto-select default template when templates load
  useEffect(() => {
    if (templates.length > 0 && !value) {
      const defaultTemplate = templates.find((t) => t.isDefault);
      if (defaultTemplate?.id) {
        onChange(defaultTemplate.id);
      }
    }
  }, [templates, value, onChange]);

  const handleGoToEditTemplate = () => {
    if (value) {
      router.push(`/templates/edit/${value}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
        <Select
          value={value}
          onValueChange={onChange}
          disabled={isLoading || templates.length === 0}
        >
          <SelectTrigger className="w-full md:w-[350px]">
            <SelectValue
              placeholder={
                isLoading
                  ? "Loading templates..."
                  : templates.length === 0
                    ? "No templates available"
                    : "Select a template"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id || ""}>
                <div className="flex items-center">
                  <span>{template.name}</span>
                  {template.isDefault && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
                      Default
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchTemplates()}
            disabled={isLoading}
            title="Refresh templates"
          >
            <RefreshCwIcon
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGoToEditTemplate}
              disabled={isLoading}
              title="Edit selected template"
            >
              Edit
            </Button>
          )}

          {onCreateNew && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCreateNew}
              disabled={isLoading}
              className="gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              New
            </Button>
          )}
        </div>
      </div>

      {templates.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          No templates available for {tone} tone. Create a new template to get
          started.
        </p>
      )}
    </div>
  );
}
