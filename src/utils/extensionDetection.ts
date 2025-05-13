
/**
 * Detects if the application is running as a Chrome extension
 */
export const isExtension = (): boolean => {
  return typeof window !== 'undefined' && 
         'chrome' in window &&
         !!window.chrome &&
         !!window.chrome.tabs;
};
