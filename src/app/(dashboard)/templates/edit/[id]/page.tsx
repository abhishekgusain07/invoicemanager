"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TemplateForm } from "../../components/template-form";
import { api } from "@/lib/trpc";
import { EmailTemplate } from "@/lib/validations/email-template";
import { toast } from "sonner";
import { ArrowLeftIcon } from "lucide-react";

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  // ✅ NEW: Using tRPC query to load template
  const {
    data: result,
    isLoading,
    error,
  } = api.templates.getById.useQuery(
    { id: templateId },
    {
      enabled: !!templateId,
      onError: (error) => {
        toast.error(error.message || "Failed to load template");
        router.push("/templates");
      },
    }
  );

  const template = result?.data || null;

  const handleCancel = () => {
    router.push("/templates");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleCancel}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Template</h2>
          <p className="text-muted-foreground">Edit your email template</p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {error.message || "Failed to load template"}
          </p>
          <Button onClick={handleCancel}>Return to Templates</Button>
        </div>
      ) : template ? (
        <TemplateForm template={template} onCancel={handleCancel} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">Template not found</p>
          <Button onClick={handleCancel}>Return to Templates</Button>
        </div>
      )}
    </div>
  );
}
