import { useState, useCallback, useRef, useEffect } from 'react';

const STORAGE_KEY = 'markingdown-sidebar';
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 160;
const MAX_WIDTH = 480;

interface SidebarState {
  width: number;
  collapsed: boolean;
}

function load(): SidebarState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SidebarState;
      return {
        width: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed.width ?? DEFAULT_WIDTH)),
        collapsed: parsed.collapsed ?? false,
      };
    }
  } catch { /* ignore */ }
  return { width: DEFAULT_WIDTH, collapsed: false };
}

function save(state: SidebarState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useSidebar() {
  const [state, setState] = useState<SidebarState>(load);
  const dragging = useRef(false);

  const toggleSidebar = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, collapsed: !prev.collapsed };
      save(next);
      return next;
    });
  }, []);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.documentElement.style.cursor = 'col-resize';
    document.documentElement.setAttribute('data-resizing', '');
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX));
      setState((prev) => ({ ...prev, width: newWidth }));
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.documentElement.style.cursor = '';
      document.documentElement.removeAttribute('data-resizing');
      setState((prev) => {
        save(prev);
        return prev;
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  return {
    sidebarWidth: state.width,
    sidebarCollapsed: state.collapsed,
    toggleSidebar,
    onResizeStart,
  } as const;
}
