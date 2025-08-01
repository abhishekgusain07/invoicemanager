"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
  onSuccess?: (email: string) => void;
  className?: string;
}

export function WaitlistForm({ onSuccess, className = "" }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      // Success!
      setIsSuccess(true);
      toast.success("🎉 Welcome to the waitlist!", {
        description: "We'll notify you when we launch!",
      });

      if (onSuccess) {
        onSuccess(data.email);
      }

      reset();
    } catch (error) {
      console.error("Waitlist signup error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to join waitlist",
        {
          description: "Please try again in a moment.",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className={`flex flex-col items-center text-center space-y-4 ${className}`}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            You're on the list! 🎉
          </h3>
          <p className="text-slate-600">
            Thanks for joining our waitlist. We'll send you an email when we
            launch!
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${className}`}
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className={`pl-10 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
            disabled={isSubmitting}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.email.message}</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Joining Waitlist...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Join the Waitlist
          </>
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        We'll only send you updates about the launch. No spam, ever.
      </p>
    </form>
  );
}
