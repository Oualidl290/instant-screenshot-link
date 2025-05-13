
/**
 * Detects if the application is running as a Chrome extension
 */
export const isExtension = (): boolean => {
  return typeof window !== 'undefined' && 
         window.chrome !== undefined && 
         !!window.chrome.tabs;
};
