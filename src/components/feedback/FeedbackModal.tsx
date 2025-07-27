"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback } from "@/actions/feedback";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Schema for the feedback form, matching our database schema
const feedbackSchema = z.object({
  feedbackContent: z
    .string()
    .min(5, { message: "Feedback must be at least 5 characters long" })
    .max(500, { message: "Feedback must be less than 500 characters" }),
  stars: z.number().min(1).max(5),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export function FeedbackModal({
  open,
  onOpenChange,
  userId,
}: FeedbackModalProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedbackContent: "",
      stars: 0,
    },
  });

  const watchedStars = form.watch("stars");

  const handleStarClick = (rating: number) => {
    form.setValue("stars", rating, { shouldValidate: true });
  };

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!userId) {
      toast.error("You must be logged in to provide feedback");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFeedback({
        ...data,
        userId,
      });

      toast.success("Thank you for your feedback!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine star color
  const getStarColor = (index: number) => {
    // If star is hovered or has been selected
    if (
      (hoveredStar !== null && index <= hoveredStar) ||
      (hoveredStar === null && index <= watchedStars)
    ) {
      return "text-yellow-400 fill-yellow-400";
    }
    return "text-gray-300";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Your Feedback Matters
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Help us improve by sharing your thoughts and experience.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <FormLabel className="block text-sm font-medium">
                How would you rate your experience?
              </FormLabel>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <motion.button
                    key={rating}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStarClick(rating)}
                    onMouseEnter={() => setHoveredStar(rating)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="focus:outline-none p-1"
                  >
                    <Star
                      size={32}
                      className={cn(
                        "transition-colors duration-200",
                        getStarColor(rating)
                      )}
                      strokeWidth={1.5}
                    />
                  </motion.button>
                ))}
              </div>
              {form.formState.errors.stars && (
                <p className="text-sm text-center text-red-500 mt-1">
                  Please select a rating
                </p>
              )}
            </div>

            {/* Feedback Content */}
            <FormField
              control={form.control}
              name="feedbackContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you think..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
