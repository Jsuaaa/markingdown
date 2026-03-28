import { contextBridge, ipcRenderer, webUtils } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // File operations
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:save', filePath, content),
  saveFileAs: (content: string, defaultName: string, defaultDir?: string) =>
    ipcRenderer.invoke('file:save-as', content, defaultName, defaultDir),
  openFile: () =>
    ipcRenderer.invoke('file:open'),
  readFile: (filePath: string) =>
    ipcRenderer.invoke('file:read', filePath),
  getPathForFile: (file: File) =>
    webUtils.getPathForFile(file),

  // App
  getPlansDir: () =>
    ipcRenderer.invoke('app:get-plans-dir'),

  // Export
  exportPDF: (markdown: string, title: string) =>
    ipcRenderer.invoke('export:pdf', markdown, title),
  exportHTML: (markdown: string, title: string) =>
    ipcRenderer.invoke('export:html', markdown, title),
  exportLaTeX: (markdown: string, title: string) =>
    ipcRenderer.invoke('export:latex', markdown, title),

  // Menu events
  onMenuEvent: (channel: string, callback: () => void) => {
    ipcRenderer.on(channel, callback)
    return () => ipcRenderer.removeListener(channel, callback)
  },
})
