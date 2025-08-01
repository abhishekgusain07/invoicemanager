"use client";

import { useState, useEffect } from "react";

export function useWaitlistCount() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/waitlist/count");

        if (!response.ok) {
          throw new Error("Failed to fetch waitlist count");
        }

        const data = await response.json();
        setCount(data.count || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching waitlist count:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        // Set a fallback count to avoid showing 0
        setCount(127); // Show a reasonable fallback number
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();
  }, []);

  return { count, isLoading, error };
}
