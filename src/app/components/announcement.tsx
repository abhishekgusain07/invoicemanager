import React from 'react';
import Link from 'next/link';

interface AnnouncementProps {
  show: boolean;
  message: string;
  link?: {
    text: string;
    url: string;
  };
  emoji?: string;
}

const Announcement = ({ show, message, link, emoji = "🚀" }: AnnouncementProps) => {
  if (!show) return null;
  
  return (
    <div className="z-50 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 py-2 border-b border-emerald-100 dark:border-emerald-900/30">
      <div className="container mx-auto px-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          {emoji} {message}{' '}
          {link && (
            <Link 
              href={link.url} 
              target={link.url.startsWith('http') ? "_blank" : undefined} 
              rel={link.url.startsWith('http') ? "noopener noreferrer" : undefined}
              className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 underline underline-offset-2"
            >
              {link.text}
            </Link>
          )}
        </p>
      </div>
    </div>
  );
};

export default Announcement; 