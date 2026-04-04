interface ElectronAPI {
  platform: string;

  // File operations
  saveFile: (filePath: string, content: string) => Promise<void>;
  saveFileAs: (content: string, defaultName: string, defaultDir?: string) => Promise<string | null>;
  openFile: () => Promise<{ filePath: string; content: string } | null>;
  readFile: (filePath: string) => Promise<string | null>;
  getPathForFile: (file: File) => string;

  // Export
  exportPDF: (markdown: string, title: string) => Promise<string | null>;
  exportHTML: (markdown: string, title: string) => Promise<string | null>;
  exportLaTeX: (markdown: string, title: string) => Promise<string | null>;

  // App
  getPlansDir: () => Promise<string>;

  // Menu events
  onMenuEvent: (channel: string, callback: () => void) => () => void;
  
  // App events
  onOpenFile: (callback: (filePath: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
