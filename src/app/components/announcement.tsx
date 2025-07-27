import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface AnnouncementProps {
  show: boolean;
  message: string;
  link?: {
    text: string;
    url: string;
  };
  emoji?: string;
  onDismiss?: () => void;
}

const Announcement = ({
  show: initialShow,
  message,
  link,
  emoji = "🚀",
  onDismiss,
}: AnnouncementProps) => {
  const [show, setShow] = useState(initialShow);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="z-50 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 py-2 border-b border-emerald-100 dark:border-emerald-900/30">
      <div className="container mx-auto px-4 relative">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center pr-8">
          {emoji} {message}{" "}
          {link && (
            <Link
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel={
                link.url.startsWith("http") ? "noopener noreferrer" : undefined
              }
              className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-2"
            >
              {link.text}
            </Link>
          )}
        </p>
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          aria-label="Dismiss announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Announcement;
