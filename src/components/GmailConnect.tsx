// components/GmailConnect.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface GmailConnectProps {
  userId: string;
  onSuccess?: () => void;
  showDescription?: boolean;
}

export function GmailConnect({ userId, onSuccess, showDescription = false }: GmailConnectProps) {
  const [isLoading, setIsLoading] = useState(false);

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
        className="flex items-center justify-center gap-2 w-64 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 font-medium py-2 px-4 rounded-md shadow-sm"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Image src="/gmail.svg" alt="Gmail" width={20} height={20} />
            <span>Connect your Gmail</span>
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