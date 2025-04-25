/**
 * Helper functions for Google API usage
 * This file provides a secure way to access the Google API key
 */

/**
 * Get the Google API key from environment variables
 * This ensures the key is never exposed in client-side code
 */
export function getGoogleApiKey() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Google API key not found. Make sure to set GOOGLE_API_KEY in your .env.local file.'
    );
  }
  
  return apiKey;
}

/**
 * Example function to create a Google API URL with the key
 * Only use this in server-side code, never in client components
 */
export function createGoogleApiUrl(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = getGoogleApiKey();
  const baseUrl = 'https://www.googleapis.com';
  
  // Build query string from params
  const queryParams = new URLSearchParams({
    ...params,
    key: apiKey,
  }).toString();
  
  return `${baseUrl}${endpoint}?${queryParams}`;
} 