// components/GmailConnect.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/button';

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
    >
      {isLoading ? 'Connecting...' : 'Connect Gmail Account'}
    </Button>
  );
}