"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  MessageSquareIcon,
  CheckCircleIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmailTemplate } from "@/lib/validations/email-template";
import { deleteTemplate } from "@/actions/templates";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TemplateListProps = {
  templates: EmailTemplate[];
  onCreateTemplate: () => void;
};

export function TemplateList({
  templates,
  onCreateTemplate,
}: TemplateListProps) {
  const router = useRouter();
  const [filterTone, setFilterTone] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter templates based on tone and search query
  const filteredTemplates = templates.filter((template) => {
    const matchesTone =
      filterTone === "all" ? true : template.tone === filterTone;
    const matchesSearch = searchQuery
      ? template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesTone && matchesSearch;
  });

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const result = await deleteTemplate(id);
      if (result.success) {
        toast.success("Template deleted successfully");
        // Refresh the UI
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("An error occurred while deleting the template");
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "polite":
        return "bg-blue-100 text-blue-800";
      case "friendly":
        return "bg-green-100 text-green-800";
      case "firm":
        return "bg-amber-100 text-amber-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      case "direct":
        return "bg-orange-100 text-orange-800";
      case "assertive":
        return "bg-purple-100 text-purple-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      case "final":
        return "bg-red-200 text-red-900";
      case "serious":
        return "bg-slate-200 text-slate-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-[250px]"
          />
          <Select value={filterTone} onValueChange={setFilterTone}>
            <SelectTrigger className="md:w-[180px]">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span>
                  {filterTone === "all"
                    ? "Filter by tone"
                    : `Filter: ${filterTone}`}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tones</SelectItem>
              <SelectItem value="polite">Polite</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="firm">Firm</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="assertive">Assertive</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onCreateTemplate} className="gap-2">
          <PlusIcon className="h-4 w-4" /> New Template
        </Button>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          {templates.length === 0 ? (
            <>
              <h3 className="text-lg font-medium">No templates found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Create your first email template to get started
              </p>
              <Button onClick={onCreateTemplate}>Create Template</Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium">No matching templates</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Try adjusting your search or filter
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilterTone("all");
                }}
              >
                Clear filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getToneColor(template.tone)}`}
                    >
                      {template.tone.charAt(0).toUpperCase() +
                        template.tone.slice(1)}
                    </span>
                    {template.isDefault && (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircleIcon className="h-3 w-3" />
                        <span>Default</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium truncate">{template.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {template.subject}
                  </p>
                </div>
                <div className="p-3 bg-muted/50">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {template.content}
                  </p>
                </div>
                <div className="p-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleDeleteTemplate(template.id!)}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" className="h-8" asChild>
                    <Link href={`/templates/edit/${template.id}`}>
                      <EditIcon className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
