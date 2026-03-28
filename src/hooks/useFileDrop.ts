import { useEffect } from 'react';
import { usePlanStore } from '../store/planStore';
import { showToast } from '../store/toastStore';

const MD_EXTENSIONS = ['.md', '.markdown', '.txt'];

function isMarkdownFile(name: string): boolean {
  return MD_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

export function useFileDrop() {
  const { createPlan, markSaved } = usePlanStore();

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      console.log('[fileDrop] dragover fired');
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      console.log('[fileDrop] drop fired');
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      console.log('[fileDrop] files count:', files?.length ?? 0);
      if (!files?.length) return;

      const api = window.electronAPI;
      console.log('[fileDrop] electronAPI available:', !!api);
      console.log('[fileDrop] getPathForFile available:', !!api?.getPathForFile);
      if (!api) return;

      for (const file of Array.from(files)) {
        console.log('[fileDrop] file.name:', file.name, 'file.type:', file.type, 'file.size:', file.size);
        const filePath = api.getPathForFile?.(file) ?? '';
        console.log('[fileDrop] resolved filePath:', filePath);
        const isMd = isMarkdownFile(filePath);
        console.log('[fileDrop] isMarkdownFile:', isMd);
        if (!filePath || !isMd) continue;

        try {
          const content = await api.readFile(filePath);
          console.log('[fileDrop] readFile result:', content != null ? `${content.length} chars` : 'null');
          if (content != null) {
            const id = createPlan(content);
            markSaved(id, filePath);
            showToast(`Opened ${file.name}`);
            console.log('[fileDrop] plan created, id:', id);
          }
        } catch (err) {
          console.error('[fileDrop] Drop open failed:', err);
          showToast(`Failed to open ${file.name}`, 'error');
        }
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [createPlan, markSaved]);
}
