import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'

function getPlansDir(): string {
  return path.join(app.getPath('documents'), 'Markingdown', 'Plans')
}

export function registerFileHandlers() {
  ipcMain.handle('app:get-plans-dir', () => {
    return getPlansDir()
  })

  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    console.log('[main:file:save] path:', filePath)
    await fs.writeFile(filePath, content, 'utf-8')
  })

  ipcMain.handle('file:save-as', async (_event, content: string, defaultName: string, defaultDir?: string) => {
    console.log('[main:file:save-as] defaultName:', defaultName)
    const win = BrowserWindow.getFocusedWindow()
    if (!win) { console.log('[main:file:save-as] no focused window'); return null }

    const dir = defaultDir || getPlansDir()
    const result = await dialog.showSaveDialog(win, {
      defaultPath: path.join(dir, defaultName),
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || !result.filePath) return null

    await fs.writeFile(result.filePath, content, 'utf-8')
    return result.filePath
  })

  ipcMain.handle('file:open', async () => {
    console.log('[main:file:open] called')
    const win = BrowserWindow.getFocusedWindow()
    if (!win) { console.log('[main:file:open] no focused window'); return null }

    const result = await dialog.showOpenDialog(win, {
      defaultPath: getPlansDir(),
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    const content = await fs.readFile(filePath, 'utf-8')
    return { filePath, content }
  })

  ipcMain.handle('file:read', async (_event, filePath: string) => {
    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch {
      return null
    }
  })
}
