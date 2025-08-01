"use client";

import { CheckCircle, Share2, Twitter, Linkedin, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WaitlistSuccessProps {
  email?: string;
  className?: string;
}

export function WaitlistSuccess({
  email,
  className = "",
}: WaitlistSuccessProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText =
    "I just joined the waitlist for InvoiceManager - the smart invoice management tool for freelancers! 🚀";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: "twitter" | "linkedin") => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <div className={`max-w-md mx-auto text-center space-y-6 ${className}`}>
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-900">
          You're on the waitlist! 🎉
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Thanks for joining! We've added <strong>{email}</strong> to our
          waitlist.
        </p>
      </div>

      {/* Timeline Badge */}
      <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
        🚀 Launching Q2 2025
      </Badge>

      {/* What's Next */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-slate-900">What happens next?</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>We'll send you updates as we get closer to launch</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>You'll get early access before the general public</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Special launch pricing just for waitlist members</span>
          </div>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 justify-center">
          <Share2 className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">
            Help us spread the word:
          </span>
        </div>

        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("twitter")}
            className="flex items-center space-x-2"
          >
            <Twitter className="w-4 h-4" />
            <span>Twitter</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("linkedin")}
            className="flex items-center space-x-2"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Link</span>
          </Button>
        </div>
      </div>

      {/* Footer Message */}
      <p className="text-xs text-slate-500">
        Questions? Reach out to us at{" "}
        <a
          href="mailto:hello@invoicemanager.app"
          className="text-blue-600 hover:underline"
        >
          hello@invoicemanager.app
        </a>
      </p>
    </div>
  );
}
