import { useEffect, useCallback } from 'react';
import {
  useThemeStore,
  deriveFullVariables,
  BUILTIN_PRESETS,
} from '../store/themeStore';
import type { BaseTheme } from '../store/themeStore';

function applyVariables(vars: Record<string, string>) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

function applyBaseTheme(baseTheme: BaseTheme) {
  document.documentElement.setAttribute('data-theme', baseTheme);
}

export function useThemeEngine() {
  const activePreset = useThemeStore((s) => s.getActivePreset());
  const draftColors = useThemeStore((s) => s.draftColors);
  const setActiveTheme = useThemeStore((s) => s.setActiveTheme);

  const colors = draftColors ?? activePreset.colors;
  const baseTheme = draftColors
    ? (activePreset.baseTheme as BaseTheme)
    : activePreset.baseTheme;

  // Apply CSS variables whenever colors change
  useEffect(() => {
    const vars = deriveFullVariables(colors, baseTheme);
    applyVariables(vars);
    applyBaseTheme(baseTheme);
  }, [colors, baseTheme]);

  // Remove no-transition guard after first render
  useEffect(() => {
    requestAnimationFrame(() => {
      document.documentElement.removeAttribute('data-no-transition');
    });
  }, []);

  // Sync with OS preference changes (only when no persisted override)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('markingdown-themes');
      if (stored) return;
      const presetId = e.matches ? 'tokyo-night' : 'warm-cream';
      setActiveTheme(presetId);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setActiveTheme]);

  const toggleTheme = useCallback(() => {
    const lightId = BUILTIN_PRESETS[0].id;
    const darkId = BUILTIN_PRESETS[1].id;
    const next = activePreset.baseTheme === 'dark' ? lightId : darkId;
    setActiveTheme(next);
  }, [activePreset.baseTheme, setActiveTheme]);

  return {
    theme: baseTheme,
    activeThemeId: activePreset.id,
    toggleTheme,
  } as const;
}
