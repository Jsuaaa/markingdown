import { useEffect, useRef, useState } from 'react';
import { usePlanStore } from '../store/planStore';
import { showToast } from '../store/toastStore';

const MD_EXTENSIONS = ['.md', '.markdown', '.txt'];

function isMarkdownFile(name: string): boolean {
  return MD_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

export function useFileDrop() {
  const { createPlan, markSaved } = usePlanStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (dragCounter.current === 1) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files?.length) return;

      const api = window.electronAPI;
      if (!api) return;

      for (const file of Array.from(files)) {
        const filePath = api.getPathForFile?.(file) ?? '';
        const isMd = isMarkdownFile(filePath);
        if (!filePath || !isMd) continue;

        try {
          const content = await api.readFile(filePath);
          if (content != null) {
            const id = createPlan(content);
            markSaved(id, filePath);
            showToast(`Opened ${file.name}`);
          }
        } catch (err) {
          console.error('[fileDrop] Drop open failed:', err);
          showToast(`Failed to open ${file.name}`, 'error');
        }
      }
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [createPlan, markSaved]);

  return { isDragging };
}
