"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TemplateForm } from "../../components/template-form";
import { getTemplateById } from "@/actions/templates";
import { EmailTemplate } from "@/lib/validations/email-template";
import { toast } from "sonner";
import { ArrowLeftIcon } from "lucide-react";

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);

      try {
        if (!params.id || typeof params.id !== "string") {
          throw new Error("Invalid template ID");
        }

        const result = await getTemplateById(params.id);

        if (result.success && result.data) {
          setTemplate(result.data);
        } else {
          toast.error(result.error || "Failed to load template");
          router.push("/templates");
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        toast.error("An error occurred while loading the template");
        router.push("/templates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id, router]);

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
