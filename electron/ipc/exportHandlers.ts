import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function markdownToHtml(markdown: string, title: string): string {
  // Basic markdown to HTML conversion for export
  // Using a simple regex-based approach for the main process
  // The full remark pipeline runs in the renderer
  const html = markdown
    // Code blocks (must be before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Task lists
    .replace(/^- \[x\] (.+)$/gm, '<li class="task checked"><input type="checkbox" checked disabled /> $1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="task"><input type="checkbox" disabled /> $1</li>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs (lines that aren't already wrapped)
    .replace(/^(?!<[hupbl1-6oirs]|<li|<hr|<pre|<code|<block)(.*\S.*)$/gm, '<p>$1</p>')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.7; color: #1a1a2e; }
    h1, h2, h3, h4 { color: #0d0d0d; margin-top: 1.5em; }
    h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
    h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.2em; }
    pre { background: #f3f4f6; padding: 1em; border-radius: 6px; overflow-x: auto; }
    code { font-family: ui-monospace, Consolas, monospace; font-size: 0.875em; background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 4px; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #6366f1; margin: 1em 0; padding: 0.75em 1.25em; background: rgba(99,102,241,0.04); border-radius: 0 6px 6px 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5em 0.75em; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }
    .task { list-style: none; }
    .task input { margin-right: 0.5em; }
    s { opacity: 0.65; }
  </style>
</head>
<body>
${html}
</body>
</html>`
}

export function registerExportHandlers() {
  ipcMain.handle('export:pdf', async (_event, markdown: string, title: string) => {
    console.log('[main:export:pdf] called, markdown length:', markdown?.length, 'title:', title)
    const win = BrowserWindow.getFocusedWindow()
    if (!win) { console.log('[main:export:pdf] no focused window'); return null }

    const result = await dialog.showSaveDialog(win, {
      defaultPath: `${title}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    })

    if (result.canceled || !result.filePath) return null

    // Create hidden window for PDF rendering
    const printWin = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    })

    const htmlContent = markdownToHtml(markdown, title)
    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    // Wait for content to render
    await new Promise((resolve) => setTimeout(resolve, 500))

    const pdfBuffer = await printWin.webContents.printToPDF({
      printBackground: true,
    })

    await fs.writeFile(result.filePath, pdfBuffer)
    printWin.destroy()

    return result.filePath
  })

  ipcMain.handle('export:html', async (_event, markdown: string, title: string) => {
    console.log('[main:export:html] called, markdown length:', markdown?.length, 'title:', title)
    const win = BrowserWindow.getFocusedWindow()
    if (!win) { console.log('[main:export:html] no focused window'); return null }

    const result = await dialog.showSaveDialog(win, {
      defaultPath: `${title}.html`,
      filters: [{ name: 'HTML', extensions: ['html', 'htm'] }],
    })

    if (result.canceled || !result.filePath) return null

    const htmlContent = markdownToHtml(markdown, title)
    await fs.writeFile(result.filePath, htmlContent, 'utf-8')

    return result.filePath
  })

  ipcMain.handle('export:latex', async (_event, markdown: string, title: string) => {
    console.log('[main:export:latex] called, markdown length:', markdown?.length, 'title:', title)
    const win = BrowserWindow.getFocusedWindow()
    if (!win) { console.log('[main:export:latex] no focused window'); return null }

    // Check if pandoc is available
    try {
      await execAsync('which pandoc')
    } catch {
      dialog.showErrorBox(
        'Pandoc not found',
        'LaTeX export requires Pandoc. Install it from https://pandoc.org/'
      )
      return null
    }

    const result = await dialog.showSaveDialog(win, {
      defaultPath: `${title}.tex`,
      filters: [{ name: 'LaTeX', extensions: ['tex'] }],
    })

    if (result.canceled || !result.filePath) return null

    // Write markdown to temp file, convert with pandoc
    const tmpDir = path.join(__dirname, '..', '.tmp')
    await fs.mkdir(tmpDir, { recursive: true })
    const tmpFile = path.join(tmpDir, `${Date.now()}.md`)

    try {
      await fs.writeFile(tmpFile, markdown, 'utf-8')
      const { stdout } = await execAsync(`pandoc "${tmpFile}" -f markdown -t latex`)
      await fs.writeFile(result.filePath, stdout, 'utf-8')
      return result.filePath
    } finally {
      await fs.unlink(tmpFile).catch(() => {})
    }
  })
}
