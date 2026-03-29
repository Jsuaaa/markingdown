import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { getEditorExtensions } from './editor/editorConfig';
import { usePlanStore } from './store/planStore';
import { useFileOperations } from './hooks/useFileOperations';
import { useAutoSave } from './hooks/useAutoSave';
import { useFileDrop } from './hooks/useFileDrop';
import { useThemeEngine } from './hooks/useThemeEngine';
import { useSidebar } from './hooks/useSidebar';
import { AppLayout } from './components/AppLayout';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Toolbar } from './components/Editor/Toolbar';
import { StatusBar } from './components/StatusBar/StatusBar';
import { ToastContainer } from './components/Toast/Toast';
import { ThemeCustomizer } from './components/ThemeCustomizer/ThemeCustomizer';
import './styles/theme.css';
import './styles/editor.css';
import './styles/layout.css';

interface MarkdownStorage {
  getMarkdown: () => string;
  parser: { parse: (md: string) => string };
}

function getMarkdownStorage(editor: Editor): MarkdownStorage {
  // tiptap-markdown adds .markdown to editor.storage at runtime
  // but TipTap's Storage type is an empty interface without an index signature
  return (editor.storage as unknown as Record<string, MarkdownStorage>).markdown;
}

function App() {
  const { plans, activeId, createPlan, updatePlanContent, closePlan } = usePlanStore();
  const activePlan = plans.find((p) => p.id === activeId);
  const { save, saveAs, open, exportPDF, exportHTML, exportLaTeX } = useFileOperations();

  useAutoSave();
  const { isDragging } = useFileDrop();
  const { toggleTheme } = useThemeEngine();
  const { sidebarWidth, sidebarCollapsed, toggleSidebar, onResizeStart } = useSidebar();
  const [showCustomizer, setShowCustomizer] = useState(false);

  const editor = useEditor({
    extensions: getEditorExtensions(),
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
      handleClick: (_view, _pos, event) => {
        const link = (event.target as HTMLElement).closest('a');
        if (link?.href) {
          event.preventDefault();
          window.open(link.href);
          return true;
        }
        return false;
      },
    },
    content: activePlan?.markdown ?? '',
    onUpdate: ({ editor }) => {
      const md = getMarkdownStorage(editor).getMarkdown();
      const { activeId: currentActiveId } = usePlanStore.getState();

      if (!currentActiveId) {
        if (md.trim()) {
          createPlan(md);
        }
        return;
      }

      updatePlanContent(currentActiveId, md);
    },
  });

  // Sync editor content when active tab changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const md = activePlan?.markdown ?? '';
      editor.commands.setContent(md);
    }
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create first plan on launch if none exist
  useEffect(() => {
    if (plans.length === 0) {
      createPlan();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 'n') {
        e.preventDefault();
        createPlan();
      } else if (e.key === 'w') {
        e.preventDefault();
        if (activeId) closePlan(activeId);
      } else if (e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        save();
      } else if (e.key === 's' && e.shiftKey) {
        e.preventDefault();
        saveAs();
      } else if (e.key === 'o') {
        e.preventDefault();
        open();
      } else if (e.key === 'b' && !e.shiftKey) {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === 'l' && e.shiftKey) {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === 't' && e.shiftKey) {
        e.preventDefault();
        setShowCustomizer((v) => !v);
      } else if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const { plans, setActivePlan } = usePlanStore.getState();
        if (index < plans.length) {
          setActivePlan(plans[index].id);
        }
      }
    },
    [activeId, createPlan, closePlan, save, saveAs, open, toggleSidebar, toggleTheme, setShowCustomizer]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Menu events from Electron
  useEffect(() => {
    if (!window.electronAPI?.onMenuEvent) return;

    const cleanups = [
      window.electronAPI.onMenuEvent('menu:new-plan', () => createPlan()),
      window.electronAPI.onMenuEvent('menu:open', () => open()),
      window.electronAPI.onMenuEvent('menu:save', () => save()),
      window.electronAPI.onMenuEvent('menu:save-as', () => saveAs()),
      window.electronAPI.onMenuEvent('menu:export-pdf', () => exportPDF()),
      window.electronAPI.onMenuEvent('menu:export-html', () => exportHTML()),
      window.electronAPI.onMenuEvent('menu:export-latex', () => exportLaTeX()),
    ];

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [createPlan, open, save, saveAs, exportPDF, exportHTML, exportLaTeX]);

  return (
    <AppLayout
      sidebar={<Sidebar />}
      title={activePlan?.title ?? 'Markingdown'}
      sidebarWidth={sidebarWidth}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={toggleSidebar}
      onResizeStart={onResizeStart}
      onOpenCustomizer={() => setShowCustomizer(true)}
      themeCustomizer={showCustomizer ? <ThemeCustomizer onClose={() => setShowCustomizer(false)} /> : undefined}
    >
      <Toolbar
        onImport={open}
        onSaveAs={saveAs}
        onExportPDF={exportPDF}
        onExportHTML={exportHTML}
        onExportLaTeX={exportLaTeX}
      />
      <div className="editor-scroll">
        <EditorContent editor={editor} />
      </div>
      <StatusBar markdown={activePlan?.markdown ?? ''} />
      <ToastContainer />
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-overlay-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Import</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default App;
