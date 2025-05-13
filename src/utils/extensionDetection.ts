
/**
 * Detects if the application is running as a Chrome extension
 */
export const isExtension = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.tabs;
};
