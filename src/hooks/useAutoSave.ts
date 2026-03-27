import { useEffect, useRef } from 'react';
import { usePlanStore } from '../store/planStore';

const AUTO_SAVE_DELAY = 2000;

export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { plans, activeId, markSaved } = usePlanStore();
  const activePlan = plans.find((p) => p.id === activeId);

  useEffect(() => {
    if (!activePlan || !activePlan.isDirty || !activePlan.filePath) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!activePlan.filePath) return;
      await window.electronAPI.saveFile(activePlan.filePath, activePlan.markdown);
      markSaved(activePlan.id, activePlan.filePath);
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timerRef.current);
  }, [activePlan, markSaved]);
}
