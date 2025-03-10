/**
 * Utility for memoizing function results to optimize performance
 * @param fn The function to memoize
 * @returns A memoized version of the function
 */
export function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();
  
  return (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

/**
 * Create a memoized function that handles multiple arguments
 * @param fn The function to memoize
 * @returns A memoized version of the function
 */
export function memoizeComplex<A extends any[], R>(fn: (...args: A) => R): (...args: A) => R {
  const cache = new Map<string, R>();
  
  return (...args: A): R => {
    // Create a cache key by stringifying the arguments
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Create a memoized function with a custom cache key generator
 * @param fn The function to memoize
 * @param keyFn Function to generate cache keys from arguments
 * @returns A memoized version of the function
 */
export function memoizeWithKeyFn<A extends any[], R, K>(fn: (...args: A) => R, keyFn: (...args: A) => K): (...args: A) => R {
  const cache = new Map<K, R>();
  
  return (...args: A): R => {
    const key = keyFn(...args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Create a memoized function with a limited cache size (LRU)
 * @param fn The function to memoize
 * @param maxSize Maximum number of results to cache
 * @returns A memoized version of the function
 */
export function memoizeLRU<T, R>(fn: (arg: T) => R, maxSize: number = 100): (arg: T) => R {
  const cache = new Map<T, R>();
  const keys: T[] = [];
  
  return (arg: T): R => {
    if (cache.has(arg)) {
      // Move key to the end of the array (most recently used)
      const index = keys.findIndex(k => k === arg);
      if (index !== -1) {
        keys.splice(index, 1);
        keys.push(arg);
      }
      return cache.get(arg)!;
    }
    
    const result = fn(arg);
    
    // If cache is full, remove the least recently used item
    if (keys.length >= maxSize) {
      const oldest = keys.shift();
      if (oldest !== undefined) {
        cache.delete(oldest);
      }
    }
    
    cache.set(arg, result);
    keys.push(arg);
    return result;
  };
}