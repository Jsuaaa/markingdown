import { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { getEditorExtensions } from './editor/editorConfig';
import { usePlanStore } from './store/planStore';
import { useFileOperations } from './hooks/useFileOperations';
import { useAutoSave } from './hooks/useAutoSave';
import { useTheme } from './hooks/useTheme';
import { AppLayout } from './components/AppLayout';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Toolbar } from './components/Editor/Toolbar';
import { StatusBar } from './components/StatusBar/StatusBar';
import { ToastContainer } from './components/Toast/Toast';
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
  const { toggleTheme } = useTheme();

  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: activePlan?.markdown ?? '',
    onUpdate: ({ editor }) => {
      if (!activeId) return;
      const md = getMarkdownStorage(editor).getMarkdown();
      updatePlanContent(activeId, md);
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
      } else if (e.key === 'l' && e.shiftKey) {
        e.preventDefault();
        toggleTheme();
      } else if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const { plans, setActivePlan } = usePlanStore.getState();
        if (index < plans.length) {
          setActivePlan(plans[index].id);
        }
      }
    },
    [activeId, createPlan, closePlan, save, saveAs, open, toggleTheme]
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
    <AppLayout sidebar={<Sidebar />} title={activePlan?.title ?? 'Markingdown'}>
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
    </AppLayout>
  );
}

export default App;
