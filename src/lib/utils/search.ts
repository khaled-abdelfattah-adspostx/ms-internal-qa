interface SearchOptions {
  caseSensitive?: boolean;
  wholeWords?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
}

interface SearchResult {
  index: number;
  match: string;
  context: string;
  lineNumber?: number;
}

class OptimizedSearch {
  private debounceTimer: number | null = null;
  private lastQuery = '';
  private lastResults: SearchResult[] = [];
  private indexCache = new Map<string, SearchResult[]>();

  /**
   * Debounced search with caching for performance
   */
  async search(
    content: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      caseSensitive = false,
      wholeWords = false,
      debounceMs = 150,
      minQueryLength = 2,
      maxResults = 1000
    } = options;

    // Return empty if query is too short
    if (query.length < minQueryLength) {
      return [];
    }

    // Use cached results if query hasn't changed
    const cacheKey = `${query}-${caseSensitive}-${wholeWords}`;
    if (this.indexCache.has(cacheKey)) {
      return this.indexCache.get(cacheKey)!.slice(0, maxResults);
    }

    // Return promise that resolves after debounce
    return new Promise((resolve) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        const results = this.performSearch(content, query, {
          caseSensitive,
          wholeWords,
          maxResults
        });
        
        // Cache results
        this.indexCache.set(cacheKey, results);
          // Limit cache size
        if (this.indexCache.size > 50) {
          const firstKey = this.indexCache.keys().next().value;
          if (firstKey) {
            this.indexCache.delete(firstKey);
          }
        }
        
        resolve(results);
      }, debounceMs);
    });
  }

  private performSearch(
    content: string,
    query: string,
    options: { caseSensitive?: boolean; wholeWords?: boolean; maxResults?: number }
  ): SearchResult[] {
    const { caseSensitive = false, wholeWords = false, maxResults = 1000 } = options;
    const results: SearchResult[] = [];
    
    let searchContent = caseSensitive ? content : content.toLowerCase();
    let searchQuery = caseSensitive ? query : query.toLowerCase();
    
    if (wholeWords) {
      searchQuery = `\\b${this.escapeRegex(searchQuery)}\\b`;
    } else {
      searchQuery = this.escapeRegex(searchQuery);
    }

    try {
      const regex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi');
      const lines = content.split('\n');
      let globalIndex = 0;

      for (let lineIndex = 0; lineIndex < lines.length && results.length < maxResults; lineIndex++) {
        const line = lines[lineIndex];
        let match;
        
        while ((match = regex.exec(caseSensitive ? line : line.toLowerCase())) !== null && results.length < maxResults) {
          const contextStart = Math.max(0, match.index - 30);
          const contextEnd = Math.min(line.length, match.index + match[0].length + 30);
          const context = line.substring(contextStart, contextEnd);
          
          results.push({
            index: globalIndex + match.index,
            match: line.substring(match.index, match.index + match[0].length),
            context: contextStart > 0 ? '...' + context : context + (contextEnd < line.length ? '...' : ''),
            lineNumber: lineIndex + 1
          });
          
          // Prevent infinite loop
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
        
        globalIndex += line.length + 1; // +1 for newline
        regex.lastIndex = 0; // Reset for next line
      }
    } catch (error) {
      console.warn('Search regex error:', error);
    }

    return results;
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  clearCache(): void {
    this.indexCache.clear();
  }

  /**
   * Highlight search matches in content
   */
  highlightMatches(content: string, query: string, className = 'search-highlight'): string {
    if (!query || query.length < 2) return content;
    
    const escapedQuery = this.escapeRegex(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return content.replace(regex, `<span class="${className}">$1</span>`);
  }

  /**
   * Virtual scrolling helper for large result sets
   */
  getVisibleItems<T>(items: T[], startIndex: number, endIndex: number): T[] {
    return items.slice(startIndex, Math.min(endIndex, items.length));
  }
}

// Export singleton instance
export const optimizedSearch = new OptimizedSearch();

// Utility function for component use
export function useOptimizedSearch() {
  return optimizedSearch;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(null, args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
