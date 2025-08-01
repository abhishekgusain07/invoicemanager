"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { StarIcon, ThumbsUpIcon, LightbulbIcon, Loader2 } from "lucide-react";

export function FeedbackFormTRPC() {
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featurePriority, setFeaturePriority] = useState<
    "low" | "medium" | "high"
  >("medium");

  // ✅ NEW: tRPC mutations with built-in loading states and error handling
  const feedbackMutation = api.feedback.submitFeedback.useMutation({
    onSuccess: () => {
      // Reset form
      setFeedbackText("");
      setFeedbackRating(0);

      // Show success message
      toast.success("Thank you for your feedback!");

      // ✅ Optional: Invalidate and refetch related queries
      // utils.feedback.getUserFeedback.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });

  const featureRequestMutation = api.feedback.submitFeatureRequest.useMutation({
    onSuccess: () => {
      // Reset form
      setFeatureTitle("");
      setFeatureDescription("");
      setFeaturePriority("medium");

      // Show success message
      toast.success("Feature request submitted successfully!");

      // ✅ Optional: Invalidate and refetch related queries
      // utils.feedback.getUserFeatureRequests.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit feature request");
    },
  });

  // ✅ NEW: Simple mutation handlers - no try/catch needed
  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim() || feedbackRating === 0) {
      toast.error("Please provide feedback text and rating");
      return;
    }

    feedbackMutation.mutate({
      feedbackContent: feedbackText,
      stars: feedbackRating,
    });
  };

  const handleFeatureRequestSubmit = () => {
    if (!featureTitle.trim() || !featureDescription.trim()) {
      toast.error("Please provide both title and description");
      return;
    }

    featureRequestMutation.mutate({
      title: featureTitle,
      description: featureDescription,
      priority: featurePriority,
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUpIcon className="h-5 w-5" />
            Share Your Feedback
          </CardTitle>
          <CardDescription>
            Help us improve by sharing your thoughts and experiences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              How would you rate your experience?
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    star <= feedbackRating ? "text-yellow-500" : "text-gray-300"
                  }`}
                  disabled={feedbackMutation.isPending}
                >
                  <StarIcon className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Feedback
            </label>
            <Textarea
              placeholder="Tell us about your experience, what you like, or what could be improved..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              disabled={feedbackMutation.isPending}
            />
          </div>

          <Button
            onClick={handleFeedbackSubmit}
            disabled={
              feedbackMutation.isPending ||
              !feedbackText.trim() ||
              feedbackRating === 0
            }
            className="w-full"
          >
            {feedbackMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Feature Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5" />
            Request a Feature
          </CardTitle>
          <CardDescription>
            Have an idea that would make the app better? Let us know!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Feature Title
            </label>
            <Input
              placeholder="Brief title for your feature idea"
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              disabled={featureRequestMutation.isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Description
            </label>
            <Textarea
              placeholder="Describe your feature idea in detail. What problem would it solve? How would it work?"
              value={featureDescription}
              onChange={(e) => setFeatureDescription(e.target.value)}
              rows={4}
              disabled={featureRequestMutation.isPending}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select
              value={featurePriority}
              onValueChange={(value: "low" | "medium" | "high") =>
                setFeaturePriority(value)
              }
              disabled={featureRequestMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Nice to have</SelectItem>
                <SelectItem value="medium">
                  Medium - Would be helpful
                </SelectItem>
                <SelectItem value="high">High - Really need this</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleFeatureRequestSubmit}
            disabled={
              featureRequestMutation.isPending ||
              !featureTitle.trim() ||
              !featureDescription.trim()
            }
            className="w-full"
          >
            {featureRequestMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feature Request"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/*
✅ MIGRATION BENEFITS FOR MUTATIONS:

1. **Built-in Loading States**: 
   - mutation.isPending automatically tracks loading
   - No manual loading state management

2. **Structured Error Handling**:
   - onError callback with typed error objects
   - Automatic error message display via toast

3. **Success Callbacks**:
   - onSuccess for form resets and user feedback
   - Query invalidation for real-time updates

4. **Optimistic Updates** (can be added):
   - Update UI immediately, rollback on error
   - Perfect for instant user feedback

5. **Type Safety**:
   - Input/output types automatically inferred
   - Compile-time validation of mutation parameters

6. **Request Deduplication**:
   - Prevents duplicate submissions
   - Built-in debouncing capabilities

BEFORE (Server Action):
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setIsSubmitting(true);
  setError(null);
  try {
    await submitFeedback(data);
    // Reset form manually
    // Show success message manually
  } catch (error) {
    setError(error.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

AFTER (tRPC):
```tsx
const mutation = api.feedback.submitFeedback.useMutation({
  onSuccess: () => {
    // Auto reset & success handling
  },
  onError: (error) => {
    // Auto error handling
  },
});

const handleSubmit = () => {
  mutation.mutate(data);
};
```

✅ ADVANCED FEATURES AVAILABLE:
- Optimistic updates with automatic rollback
- Query invalidation for real-time sync
- Request retry with exponential backoff
- Global loading/error state management
- Middleware for logging, analytics, etc.
*/
