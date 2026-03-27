# Markingdown

Editor WYSIWYG de Markdown estilo Typora, especializado en visualizar planes generados por Claude Code.

## Stack

- **Desktop**: Electron 41 (`electron/main.ts`, `electron/preload.ts`)
- **Frontend**: React 19 + TypeScript 5.9 + Vite 8
- **Editor**: TipTap v2 + `tiptap-markdown` (serialización bidireccional markdown↔ProseMirror)
- **Estado**: Zustand con persistencia en localStorage
- **ANSI cleanup**: `strip-ansi` para limpiar output de terminal
- **Syntax highlight**: `lowlight` (common languages)
- **Export**: PDF (Electron printToPDF), HTML (remark/rehype), LaTeX (pandoc subprocess)

## Architecture

```
src/
  App.tsx                          — Root: editor, sidebar, toolbar, statusbar, shortcuts
  store/planStore.ts               — Zustand store: plans CRUD, tab management, persist
  store/types.ts                   — Plan, AppState interfaces
  editor/editorConfig.ts           — TipTap extensions config (StarterKit, Table, TaskList, CodeBlockLowlight, Markdown, ClaudeCodePaste)
  editor/extensions/claudeCodePaste.ts — Custom paste handler: strips ANSI, inserts clean markdown
  components/AppLayout.tsx         — CSS Grid shell: titlebar + sidebar + editor area
  components/TitleBar.tsx          — macOS draggable titlebar (-webkit-app-region: drag)
  components/Sidebar/Sidebar.tsx   — Left panel with plan tabs
  components/Sidebar/TabItem.tsx   — Individual tab: title, dirty dot, close button
  components/Editor/Toolbar.tsx    — Formatting buttons (bold, italic, headings, lists, etc.)
  components/StatusBar/StatusBar.tsx — Word/char count + export buttons (PDF, HTML, LaTeX)
  hooks/useFileOperations.ts       — Save/SaveAs/Open via Electron IPC
  hooks/useAutoSave.ts             — Debounced auto-save (2s) for files with existing path
  utils/terminalCleaner.ts         — stripAnsiCodes, dedent, normalizeBlankLines, cleanTerminalOutput
  utils/markdownHelpers.ts         — extractTitle, wordCount, charCount
  styles/theme.css                 — CSS custom properties: light/dark, gutter, titlebar
  styles/editor.css                — .ProseMirror content styles + line numbers gutter
  styles/layout.css                — App grid layout + gutter background
electron/
  main.ts                          — BrowserWindow, IPC registration, menu
  preload.ts                       — contextBridge: file ops, export, menu events
  menu.ts                          — Electron app menu (File, Edit, View)
  ipc/fileHandlers.ts              — file:save, file:save-as, file:open, file:read
  ipc/exportHandlers.ts            — export:pdf, export:html, export:latex
  ipc/index.ts                     — registerAllHandlers()
```

## Key Patterns

- **Markdown round-trip**: Content stored as raw markdown in Zustand. When switching tabs, use `editor.storage.markdown.parser.parse(md)` to convert markdown→HTML before `setContent()`. The initial `content` prop is auto-parsed by tiptap-markdown's `onBeforeCreate` hook.
- **Table support**: Tables come from `@tiptap/extension-table` (named exports: `Table, TableRow, TableCell, TableHeader`), parsed by markdown-it inside tiptap-markdown.
- **Line numbers**: CSS counters on `.ProseMirror > *` with `::after` pseudo-elements. Gutter drawn via gradient backgrounds on `.editor-scroll`.
- **Dark mode**: Automatic via `prefers-color-scheme` media query on CSS custom properties.
- **macOS titlebar**: `titleBarStyle: 'hiddenInset'` in Electron + custom `TitleBar` component with `-webkit-app-region: drag`.

## Commands

```bash
npm run dev      # Start dev server + Electron
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run dist     # Build + electron-builder package
```

## TypeScript

- Strict mode with `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`
- Use `type` keyword for type-only imports
- `tsconfig.app.json` for `src/`, `tsconfig.node.json` for `electron/` + `vite.config.ts`
