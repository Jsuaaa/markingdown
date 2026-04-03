import { app, BrowserWindow, Menu, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { registerAllHandlers } from './ipc/index'
import { buildMenu } from './menu'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let fileToOpen: string | null = null

app.on('open-file', (event, path) => {
  console.log('[main:open-file] path:', path)
  event.preventDefault()
  
  if (app.isReady() && BrowserWindow.getAllWindows().length > 0) {
    BrowserWindow.getAllWindows()[0].webContents.send('app:open-file', path)
  } else {
    fileToOpen = path
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.webContents.on('did-finish-load', () => {
    if (fileToOpen) {
      win.webContents.send('app:open-file', fileToOpen)
      fileToOpen = null
    }
  })
}

app.whenReady().then(async () => {
  // Create default plans directory
  const plansDir = path.join(app.getPath('documents'), 'Markingdown', 'Plans')
  await fs.mkdir(plansDir, { recursive: true })

  registerAllHandlers()
  Menu.setApplicationMenu(buildMenu())
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
