
/**
 * Detects if the application is running as a Chrome extension
 */
export const isExtension = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.chrome !== 'undefined' && 
         typeof window.chrome.tabs !== 'undefined';
};
