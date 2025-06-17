interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    domContentLoaded: 0
  };

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Basic timing metrics
    if (typeof performance !== 'undefined') {
      // DOM Content Loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.metrics.domContentLoaded = performance.now();
        });
      } else {
        this.metrics.domContentLoaded = performance.now();
      }

      // Window load
      if (document.readyState !== 'complete') {
        window.addEventListener('load', () => {
          this.metrics.loadTime = performance.now();
          this.reportMetrics();
        });
      } else {
        this.metrics.loadTime = performance.now();
        this.reportMetrics();
      }

      // Web Vitals if available
      this.initializeWebVitals();
    }
  }

  private initializeWebVitals() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any; // Type assertion for FID entries
            this.metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const clsEntry = entry as any; // Type assertion for layout shift entries
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value;
              this.metrics.cumulativeLayoutShift = clsValue;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  private reportMetrics() {
    // Only log in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.group('🚀 Performance Metrics');
      console.log('DOM Content Loaded:', this.formatTime(this.metrics.domContentLoaded));
      console.log('Full Load Time:', this.formatTime(this.metrics.loadTime));
      
      if (this.metrics.firstContentfulPaint) {
        console.log('First Contentful Paint:', this.formatTime(this.metrics.firstContentfulPaint));
      }
      
      if (this.metrics.largestContentfulPaint) {
        console.log('Largest Contentful Paint:', this.formatTime(this.metrics.largestContentfulPaint));
      }
      
      if (this.metrics.firstInputDelay) {
        console.log('First Input Delay:', this.formatTime(this.metrics.firstInputDelay));
      }
      
      if (this.metrics.cumulativeLayoutShift) {
        console.log('Cumulative Layout Shift:', this.metrics.cumulativeLayoutShift.toFixed(4));
      }
      
      console.groupEnd();
      
      this.generateScoreCard();
    }
  }

  private generateScoreCard() {
    const scores = {
      loadTime: this.getLoadTimeScore(this.metrics.loadTime),
      fcp: this.getFCPScore(this.metrics.firstContentfulPaint || 0),
      lcp: this.getLCPScore(this.metrics.largestContentfulPaint || 0),
      fid: this.getFIDScore(this.metrics.firstInputDelay || 0),
      cls: this.getCLSScore(this.metrics.cumulativeLayoutShift || 0)
    };

    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    console.group('📊 Performance Score Card');
    console.log(`Overall Score: ${this.getScoreEmoji(overallScore)} ${Math.round(overallScore)}/100`);
    console.log(`Load Time: ${this.getScoreEmoji(scores.loadTime)} ${Math.round(scores.loadTime)}/100`);
    console.log(`First Contentful Paint: ${this.getScoreEmoji(scores.fcp)} ${Math.round(scores.fcp)}/100`);
    console.log(`Largest Contentful Paint: ${this.getScoreEmoji(scores.lcp)} ${Math.round(scores.lcp)}/100`);
    console.log(`First Input Delay: ${this.getScoreEmoji(scores.fid)} ${Math.round(scores.fid)}/100`);
    console.log(`Cumulative Layout Shift: ${this.getScoreEmoji(scores.cls)} ${Math.round(scores.cls)}/100`);
    console.groupEnd();
  }

  private formatTime(time: number): string {
    return `${Math.round(time)}ms`;
  }

  private getLoadTimeScore(time: number): number {
    if (time <= 1000) return 100;
    if (time <= 2000) return 80;
    if (time <= 3000) return 60;
    if (time <= 5000) return 40;
    return 20;
  }

  private getFCPScore(time: number): number {
    if (time <= 1000) return 100;
    if (time <= 2000) return 80;
    if (time <= 3000) return 60;
    return 40;
  }

  private getLCPScore(time: number): number {
    if (time <= 2500) return 100;
    if (time <= 4000) return 80;
    return 60;
  }

  private getFIDScore(time: number): number {
    if (time <= 100) return 100;
    if (time <= 300) return 80;
    return 60;
  }

  private getCLSScore(score: number): number {
    if (score <= 0.1) return 100;
    if (score <= 0.25) return 80;
    return 60;
  }

  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Utility methods for component use
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getResourceTiming(): any[] {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return [];
    }
    
    return performance.getEntriesByType('resource').map((resource: any) => ({
      name: resource.name,
      duration: Math.round(resource.duration),
      size: resource.transferSize ? this.formatBytes(resource.transferSize) : 'Unknown',
      type: this.getResourceType(resource.name)
    }));
  }

  private static getResourceType(url: string): string {
    if (url.includes('.js')) return 'JavaScript';
    if (url.includes('.css')) return 'CSS';
    if (url.includes('.svg') || url.includes('.png') || url.includes('.jpg')) return 'Image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'Font';
    return 'Other';
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export class for manual instantiation if needed
export { PerformanceMonitor };

// Utility for measuring function performance
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`⏱️ ${name}: ${Math.round(end - start)}ms`);
  return result;
}

// Utility for measuring async function performance
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`⏱️ ${name}: ${Math.round(end - start)}ms`);
  return result;
}
