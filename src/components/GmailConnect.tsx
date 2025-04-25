// components/GmailConnect.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Mail, Plus, Loader2 } from 'lucide-react';

interface GmailConnectProps {
  userId: string;
  onSuccess?: () => void;
}

export function GmailConnect({ userId, onSuccess }: GmailConnectProps) {
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
    <Button 
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2 rounded-full transition-colors"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Connect Gmail
        </>
      )}
    </Button>
  );
}