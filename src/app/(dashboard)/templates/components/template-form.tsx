"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EmailTemplate } from "@/lib/validations/email-template";
import { createTemplate, updateTemplate } from "@/actions/templates";
import { useRouter } from "next/navigation";

type TemplateFormProps = {
  template?: EmailTemplate;
  onCancel: () => void;
};

// Define the tone type based on available values
type ToneType = 'polite' | 'friendly' | 'neutral' | 'firm' | 'direct' | 'assertive' | 'urgent' | 'final' | 'serious';

export function TemplateForm({ template, onCancel }: TemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [content, setContent] = useState(template?.content || "");
  const [tone, setTone] = useState<ToneType>((template?.tone as ToneType) || "polite");
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);

  const isEditMode = !!template;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name || !subject || !content) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("subject", subject);
      formData.append("content", content);
      formData.append("tone", tone);
      formData.append("isDefault", isDefault.toString());
      
      let result;
      
      if (isEditMode && template.id) {
        result = await updateTemplate(template.id, formData);
      } else {
        result = await createTemplate(formData);
      }
      
      if (result.success) {
        toast.success(isEditMode ? "Template updated successfully" : "Template created successfully");
        router.refresh();
        onCancel(); // Close the form
      } else {
        toast.error(result.error || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("An error occurred while saving the template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to insert placeholders into the content
  const insertPlaceholder = (placeholder: string) => {
    setContent(currentContent => {
      // Get cursor position or use the end of the text if not available
      const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
      const cursorPos = textarea?.selectionStart ?? currentContent.length;
      
      // Insert the placeholder at the cursor position
      const newContent = 
        currentContent.substring(0, cursorPos) + 
        `{${placeholder}}` + 
        currentContent.substring(cursorPos);
      
      return newContent;
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="template-name" className="text-base font-medium">
                Template Name
              </Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., First Payment Reminder"
                required
              />
            </div>
            
            {/* Tone Selection */}
            <div className="space-y-2">
              <Label htmlFor="template-tone" className="text-base font-medium">
                Tone
              </Label>
              <Select value={tone} onValueChange={(value: ToneType) => setTone(value)}>
                <SelectTrigger id="template-tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="polite">Polite</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="firm">Firm</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="assertive">Assertive</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="final">Final Notice</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Email Subject */}
          <div className="space-y-2">
            <Label htmlFor="template-subject" className="text-base font-medium">
              Email Subject
            </Label>
            <Input
              id="template-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Payment Reminder: Invoice {invoice_number} is Overdue"
              required
            />
          </div>
          
          {/* Template Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template-content" className="text-base font-medium">
                Email Body
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="is-default" className="text-sm cursor-pointer">
                  Set as default for {tone} tone
                </Label>
                <Switch
                  id="is-default"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
              </div>
            </div>
            <Textarea
              id="template-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Dear {client_name},

I hope this email finds you well. This is a friendly reminder that invoice #{invoice_number} for {invoice_amount} was due on {due_date}.

If you've already made the payment, please disregard this message. If not, I would appreciate your prompt attention to this matter.

You can view and pay the invoice here: {invoice_link}

Thank you for your business.

Best regards,
{sender_name}"
              required
            />
          </div>
          
          {/* Placeholders Section */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Available Placeholders:</Label>
            <div className="flex flex-wrap gap-2">
              {["client_name", "invoice_number", "invoice_amount", "due_date", "days_overdue", "invoice_link", "sender_name"].map((placeholder) => (
                <Button 
                  key={placeholder}
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => insertPlaceholder(placeholder)}
                >
                  {placeholder}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditMode ? "Update Template" : "Create Template"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 