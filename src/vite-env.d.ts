
/// <reference types="vite/client" />

// Chrome extension API type definitions
interface Chrome {
  tabs: {
    query: (queryInfo: { active: boolean; currentWindow: boolean }) => Promise<Tab[]>;
    captureVisibleTab: () => Promise<string>;
  };
}

interface Tab {
  id?: number;
  url?: string;
  title?: string;
}

// Make chrome available globally
declare global {
  interface Window {
    chrome: Chrome;
  }
  var chrome: Chrome;
}
