'use client';

import React from 'react';

// Performance monitoring utilities
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    
    // Monitor navigation timing
    this.observeNavigation();
    
    // Monitor resource loading
    this.observeResources();
  }

  // Largest Contentful Paint
  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        this.recordMetric('LCP', lastEntry.startTime);
        
        // Send to analytics
        this.sendMetric('lcp', lastEntry.startTime, 'ms');
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }
  }

  // First Input Delay
  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
          this.sendMetric('fid', entry.processingStart - entry.startTime, 'ms');
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('FID', observer);
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }
  }

  // Cumulative Layout Shift
  private observeCLS() {
    try {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.recordMetric('CLS', clsValue);
        this.sendMetric('cls', clsValue, 'score');
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }

  // Navigation timing
  private observeNavigation() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const ttfb = entry.responseStart - entry.requestStart;
          const domLoad = entry.domContentLoadedEventEnd - entry.navigationStart;
          const windowLoad = entry.loadEventEnd - entry.navigationStart;
          
          this.recordMetric('TTFB', ttfb);
          this.recordMetric('DOM_LOAD', domLoad);
          this.recordMetric('WINDOW_LOAD', windowLoad);
          
          this.sendMetric('ttfb', ttfb, 'ms');
          this.sendMetric('dom_load', domLoad, 'ms');
          this.sendMetric('window_load', windowLoad, 'ms');
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', observer);
    } catch (error) {
      console.warn('Navigation observer not supported:', error);
    }
  }

  // Resource loading timing
  private observeResources() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.initiatorType === 'fetch' && entry.name.includes('/api/trpc')) {
            const duration = entry.responseEnd - entry.requestStart;
            this.recordMetric('TRPC_REQUEST', duration);
            
            // Track tRPC request performance
            this.sendMetric('trpc_request_duration', duration, 'ms', {
              endpoint: this.extractTRPCEndpoint(entry.name),
              method: 'unknown', // Would need more context to determine
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resources', observer);
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }
  }

  // Extract tRPC endpoint from URL
  private extractTRPCEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Record metric locally
  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  // Send metric to analytics service
  public sendMetric(name: string, value: number, unit: string, additionalData?: Record<string, any>) {
    // Send to PostHog if available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('performance_metric', {
        metric_name: name,
        metric_value: value,
        metric_unit: unit,
        timestamp: Date.now(),
        url: window.location.pathname,
        user_agent: navigator.userAgent,
        ...additionalData,
      });
    }

    // Send to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric: ${name} = ${value}${unit}`, additionalData);
    }
  }

  // Manual timing for custom operations
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
      this.sendMetric(name, duration, 'ms');
    };
  }

  // Track tRPC query performance
  trackTRPCQuery(procedure: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.recordMetric(`TRPC_${procedure.toUpperCase()}`, duration);
    this.sendMetric('trpc_query_duration', duration, 'ms', {
      procedure,
      timestamp: Date.now(),
    });
  }

  // Track tRPC mutation performance
  trackTRPCMutation(procedure: string, startTime: number, success: boolean) {
    const duration = performance.now() - startTime;
    this.recordMetric(`TRPC_MUTATION_${procedure.toUpperCase()}`, duration);
    this.sendMetric('trpc_mutation_duration', duration, 'ms', {
      procedure,
      success,
      timestamp: Date.now(),
    });
  }

  // Get performance summary
  getMetricsSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      summary[name] = { avg, min, max, count: values.length };
    });
    
    return summary;
  }

  // Track user interactions
  trackUserInteraction(action: string, element?: string) {
    this.sendMetric('user_interaction', 1, 'count', {
      action,
      element,
      timestamp: Date.now(),
    });
  }

  // Track page load performance
  trackPageLoad(pageName: string) {
    const loadTime = performance.now();
    this.sendMetric('page_load', loadTime, 'ms', {
      page: pageName,
      timestamp: Date.now(),
    });
  }

  // Clean up observers
  destroy() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.metrics.clear();
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance tracking
export function usePerformanceTracking() {
  return {
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    trackTRPCQuery: performanceMonitor.trackTRPCQuery.bind(performanceMonitor),
    trackTRPCMutation: performanceMonitor.trackTRPCMutation.bind(performanceMonitor),
    trackUserInteraction: performanceMonitor.trackUserInteraction.bind(performanceMonitor),
    trackPageLoad: performanceMonitor.trackPageLoad.bind(performanceMonitor),
    getMetricsSummary: performanceMonitor.getMetricsSummary.bind(performanceMonitor),
  };
}

// Higher-order component for page performance tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  pageName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    React.useEffect(() => {
      performanceMonitor.trackPageLoad(pageName);
    }, []);

    return React.createElement(Component, props);
  };
}

// Hook for tracking component render performance
export function useRenderTracking(componentName: string) {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    
    if (renderCount.current > 1) {
      performanceMonitor.sendMetric('component_rerender', 1, 'count', {
        component: componentName,
        render_count: renderCount.current,
      });
    }
  });
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).__performanceMonitor = performanceMonitor;
}