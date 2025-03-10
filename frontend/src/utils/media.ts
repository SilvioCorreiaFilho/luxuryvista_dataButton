/**
 * Media utilities for handling URLs and image processing
 */

/**
 * Gets the full URL for a media asset
 * 
 * @param url The URL or path to the media asset
 * @returns The full URL to the media asset
 */
export function getMediaUrl(url: string): string {
  if (!url) return '';
  
  // Handle absolute URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle Supabase storage URLs
  if (url.includes('storage/v1/object/public/')) {
    return url;
  }
  
  // Handle relative URLs by treating them as absolute
  return url;
}

/**
 * Media utility functions
 */
const media = {
  /**
   * Gets the full URL for a media asset
   * @param url The URL or path to the media asset
   * @returns The full URL to the media asset
   */
  getMediaUrl,
};

export default media;
