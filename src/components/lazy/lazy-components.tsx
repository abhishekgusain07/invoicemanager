import dynamic from 'next/dynamic';
import { type LucideIcon } from 'lucide-react';
import { type ComponentType } from 'react';

export const LazyPricing = dynamic(() => import('@/components/pricing'), {
  loading: () => <div className="h-[600px] w-full animate-pulse bg-muted/50" />,
  ssr: false,
});

export const LazyProblemSection = dynamic(() => import('@/app/components/problem'), {
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted/50" />,
});

export const LazySolutionSection = dynamic(() => import('@/app/components/solution'), {
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted/50" />,
});

export const LazyTechnologyUsed = dynamic(() => import('@/app/components/techused'), {
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50" />,
});

// Dynamic import for Lucide icons
export const dynamicIconImport = (iconName: string): ComponentType<LucideIcon> => {
  return dynamic(
    () =>
      import('lucide-react').then((mod) => mod[iconName as keyof typeof mod] as ComponentType<LucideIcon>),
    {
      loading: () => <span className="inline-block h-6 w-6 animate-pulse rounded bg-muted" />,
      ssr: false,
    }
  );
};
