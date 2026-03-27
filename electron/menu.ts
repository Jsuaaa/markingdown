import { Menu, BrowserWindow } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'

function sendToRenderer(channel: string) {
  const win = BrowserWindow.getFocusedWindow()
  if (win) win.webContents.send(channel)
}

export function buildMenu(): Menu {
  const isMac = process.platform === 'darwin'

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: 'Markingdown',
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Plan',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendToRenderer('menu:new-plan'),
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendToRenderer('menu:open'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendToRenderer('menu:save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendToRenderer('menu:save-as'),
        },
        { type: 'separator' },
        {
          label: 'Export as PDF',
          click: () => sendToRenderer('menu:export-pdf'),
        },
        {
          label: 'Export as HTML',
          click: () => sendToRenderer('menu:export-html'),
        },
        {
          label: 'Export as LaTeX',
          click: () => sendToRenderer('menu:export-latex'),
        },
        ...(isMac ? [] : [{ type: 'separator' as const }, { role: 'quit' as const }]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ]

  return Menu.buildFromTemplate(template)
}
