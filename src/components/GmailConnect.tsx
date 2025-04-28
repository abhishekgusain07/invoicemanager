// components/GmailConnect.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GmailConnectProps {
  userId: string;
  onSuccess?: () => void;
  showDescription?: boolean;
}

export function GmailConnect({ userId, onSuccess, showDescription = false }: GmailConnectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gmail/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to generate auth URL');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button 
        onClick={handleConnect}
        disabled={isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex items-center justify-center gap-3 w-64 py-2.5 px-6 rounded-lg font-medium", 
          "transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]",
          "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400",
          "shadow-lg hover:shadow-blue-500/40 overflow-hidden",
          isLoading && "opacity-90"
        )}
        size="lg"
      >
        {/* Animated background shine effect */}
        <span 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "transition-transform duration-1000 ease-in-out",
            isHovered ? "translate-x-full" : "-translate-x-full"
          )} 
        />

        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-semibold">Connecting...</span>
          </>
        ) : (
          <>
            <div className="bg-white/90 p-1 rounded-md flex items-center justify-center">
              <Image src="/gmail.svg" alt="Gmail" width={18} height={18} className="drop-shadow-sm" />
            </div>
            <span className="font-semibold tracking-wide">Connect Gmail</span>
          </>
        )}
      </Button>
      
      {showDescription && (
        <div className="mt-4 max-w-md text-sm text-gray-500 text-center">
          <p>Connect your Gmail account to automatically send invoice reminders and follow-ups to clients. 
          InvoiceManager will only request access to send emails on your behalf.</p>
        </div>
      )}
    </div>
  );
}