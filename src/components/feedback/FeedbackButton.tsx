"use client";

import { Button } from "@/components/ui/button";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { MessageSquareHeart } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export function FeedbackButton() {
  const { user } = useUser();
  const { openFeedbackModal, FeedbackModalComponent } = useFeedbackModal(user?.id);

  return (
    <>
      <Button
        onClick={openFeedbackModal}
        className="group flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      >
        <MessageSquareHeart size={18} className="group-hover:animate-pulse" />
        <span>Share Feedback</span>
      </Button>
      <FeedbackModalComponent />
    </>
  );
} 