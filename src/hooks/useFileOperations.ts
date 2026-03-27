import { useCallback } from 'react';
import { usePlanStore } from '../store/planStore';
import { showToast } from '../store/toastStore';

function getAPI() {
  return window.electronAPI;
}

export function useFileOperations() {
  const { plans, activeId, createPlan, markSaved } = usePlanStore();
  const activePlan = plans.find((p) => p.id === activeId);

  const save = useCallback(async () => {
    const api = getAPI();
    console.log('[save] api:', !!api, 'activePlan:', !!activePlan);
    if (!api || !activePlan) return;

    try {
      if (activePlan.filePath) {
        await api.saveFile(activePlan.filePath, activePlan.markdown);
        markSaved(activePlan.id, activePlan.filePath);
        showToast('File saved');
      } else {
        const plansDir = await api.getPlansDir();
        const filePath = await api.saveFileAs(
          activePlan.markdown,
          `${activePlan.title}.md`,
          plansDir
        );
        if (filePath) {
          markSaved(activePlan.id, filePath);
          showToast('File saved');
        }
      }
    } catch (err) {
      console.error('Save failed:', err);
      showToast(`Save failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  }, [activePlan, markSaved]);

  const saveAs = useCallback(async () => {
    const api = getAPI();
    console.log('[saveAs] api:', !!api, 'activePlan:', !!activePlan);
    if (!api || !activePlan) return;

    try {
      const plansDir = await api.getPlansDir();
      const filePath = await api.saveFileAs(
        activePlan.markdown,
        `${activePlan.title}.md`,
        plansDir
      );
      if (filePath) {
        markSaved(activePlan.id, filePath);
        showToast('File saved');
      }
    } catch (err) {
      console.error('Save As failed:', err);
      showToast(`Save As failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  }, [activePlan, markSaved]);

  const open = useCallback(async () => {
    const api = getAPI();
    console.log('[open] api:', !!api);
    if (!api) return;

    try {
      const result = await api.openFile();
      if (!result) return;

      const id = createPlan(result.content);
      markSaved(id, result.filePath);
      showToast('File opened');
    } catch (err) {
      console.error('Open failed:', err);
      showToast(`Open failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  }, [createPlan, markSaved]);

  const exportPDF = useCallback(async () => {
    const api = getAPI();
    console.log('[exportPDF] api:', !!api, 'activePlan:', !!activePlan);
    if (!api || !activePlan) return;

    try {
      const filePath = await api.exportPDF(activePlan.markdown, activePlan.title);
      if (filePath) {
        showToast('Exported to PDF');
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast(`PDF export failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  }, [activePlan]);

  const exportHTML = useCallback(async () => {
    const api = getAPI();
    console.log('[exportHTML] api:', !!api, 'activePlan:', !!activePlan);
    if (!api || !activePlan) return;

    try {
      const filePath = await api.exportHTML(activePlan.markdown, activePlan.title);
      if (filePath) {
        showToast('Exported to HTML');
      }
    } catch (err) {
      console.error('HTML export failed:', err);
      showToast(`HTML export failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  }, [activePlan]);

  const exportLaTeX = useCallback(async () => {
    const api = getAPI();
    console.log('[exportLaTeX] api:', !!api, 'activePlan:', !!activePlan);
    if (!api || !activePlan) return;

    try {
      const filePath = await api.exportLaTeX(activePlan.markdown, activePlan.title);
      if (filePath) {
        showToast('Exported to LaTeX');
      }
    } catch (err) {
      console.error('LaTeX export failed:', err);
      showToast(`LaTeX export failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  }, [activePlan]);

  return { save, saveAs, open, exportPDF, exportHTML, exportLaTeX };
}
