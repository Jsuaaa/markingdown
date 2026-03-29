import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { lighten, darken, withAlpha, luminance } from '../utils/colorUtils';

export type BaseTheme = 'light' | 'dark';

export interface ColorTokens {
  editorBg: string;
  editorText: string;
  headingText: string;
  sidebarBg: string;
  sidebarText: string;
  toolbarBg: string;
  toolbarText: string;
  accent: string;
  codeBg: string;
  border: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  baseTheme: BaseTheme;
  colors: ColorTokens;
  builtIn: boolean;
}

export const BUILTIN_PRESETS: ThemePreset[] = [
  {
    id: 'warm-cream',
    name: 'Warm Cream',
    baseTheme: 'light',
    builtIn: true,
    colors: {
      editorBg: '#F4F2D9',
      editorText: '#1a1a2e',
      headingText: '#0d0d0d',
      sidebarBg: '#EDEBCF',
      sidebarText: '#5c5a44',
      toolbarBg: '#F4F2D9',
      toolbarText: '#3d3b28',
      accent: '#6366f1',
      codeBg: '#EBE9CE',
      border: '#D5D3B8',
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    baseTheme: 'dark',
    builtIn: true,
    colors: {
      editorBg: '#1a1b26',
      editorText: '#c0caf5',
      headingText: '#e0e0e0',
      sidebarBg: '#16161e',
      sidebarText: '#565f89',
      toolbarBg: '#1a1b26',
      toolbarText: '#a9b1d6',
      accent: '#7aa2f7',
      codeBg: '#24283b',
      border: '#1f2335',
    },
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    baseTheme: 'light',
    builtIn: true,
    colors: {
      editorBg: '#fdf6e3',
      editorText: '#657b83',
      headingText: '#073642',
      sidebarBg: '#eee8d5',
      sidebarText: '#586e75',
      toolbarBg: '#fdf6e3',
      toolbarText: '#586e75',
      accent: '#268bd2',
      codeBg: '#eee8d5',
      border: '#d3cbb7',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    baseTheme: 'dark',
    builtIn: true,
    colors: {
      editorBg: '#2e3440',
      editorText: '#d8dee9',
      headingText: '#eceff4',
      sidebarBg: '#272c36',
      sidebarText: '#7b88a1',
      toolbarBg: '#2e3440',
      toolbarText: '#d8dee9',
      accent: '#88c0d0',
      codeBg: '#3b4252',
      border: '#3b4252',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    baseTheme: 'dark',
    builtIn: true,
    colors: {
      editorBg: '#272822',
      editorText: '#f8f8f2',
      headingText: '#f8f8f0',
      sidebarBg: '#1e1f1c',
      sidebarText: '#75715e',
      toolbarBg: '#272822',
      toolbarText: '#f8f8f2',
      accent: '#a6e22e',
      codeBg: '#3e3d32',
      border: '#3e3d32',
    },
  },
];

export function deriveFullVariables(
  tokens: ColorTokens,
  baseTheme: BaseTheme,
): Record<string, string> {
  const isDark = baseTheme === 'dark';
  const shift = isDark ? lighten : darken;
  const smallShift = 0.06;
  const medShift = 0.12;

  return {
    // Editor
    '--editor-bg': tokens.editorBg,
    '--editor-text': tokens.editorText,
    '--editor-heading': tokens.headingText,
    '--editor-link': tokens.accent,
    '--editor-code-bg': tokens.codeBg,
    '--editor-code-text': isDark ? lighten(tokens.editorText, 0.1) : darken(tokens.editorText, 0.05),
    '--editor-blockquote-border': tokens.accent,
    '--editor-blockquote-bg': withAlpha(tokens.accent, 0.06),
    '--editor-table-border': tokens.border,
    '--editor-table-header-bg': shift(tokens.editorBg, smallShift),
    '--editor-selection': withAlpha(tokens.accent, isDark ? 0.2 : 0.18),
    '--editor-cursor': tokens.editorText,
    '--editor-hr': tokens.border,
    '--editor-placeholder': isDark ? lighten(tokens.sidebarText, 0.05) : darken(tokens.sidebarText, 0.05),
    '--todo-border': isDark ? '#fbbf24' : '#f59e0b',
    '--todo-bg': isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(245, 158, 11, 0.1)',

    // Sidebar
    '--sidebar-bg': tokens.sidebarBg,
    '--sidebar-border': tokens.border,
    '--sidebar-hover': shift(tokens.sidebarBg, smallShift),
    '--sidebar-active': shift(tokens.sidebarBg, medShift),
    '--sidebar-text': tokens.sidebarText,
    '--sidebar-text-active': isDark ? lighten(tokens.sidebarText, 0.5) : darken(tokens.sidebarText, 0.5),
    '--sidebar-header': isDark ? lighten(tokens.sidebarText, 0.5) : darken(tokens.sidebarText, 0.5),

    // Toolbar
    '--toolbar-bg': tokens.toolbarBg,
    '--toolbar-border': tokens.border,
    '--toolbar-btn-hover': shift(tokens.toolbarBg, smallShift),
    '--toolbar-btn-active': shift(tokens.toolbarBg, medShift),
    '--toolbar-btn-active-text': tokens.accent,
    '--toolbar-text': tokens.toolbarText,
    '--toolbar-separator': tokens.border,

    // StatusBar
    '--statusbar-bg': tokens.sidebarBg,
    '--statusbar-border': tokens.border,
    '--statusbar-text': tokens.sidebarText,

    // Gutter / line numbers
    '--line-number-color': tokens.sidebarText,
    '--gutter-bg': tokens.sidebarBg,
    '--gutter-border': tokens.border,

    // UI
    '--accent': tokens.accent,
    '--accent-hover': isDark ? lighten(tokens.accent, 0.1) : darken(tokens.accent, 0.1),
    '--shadow-sm': isDark
      ? '0 1px 2px rgba(0, 0, 0, 0.3)'
      : '0 1px 2px rgba(0, 0, 0, 0.05)',
    '--shadow-md': isDark
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  };
}

export function inferBaseTheme(editorBg: string): BaseTheme {
  return luminance(editorBg) > 0.5 ? 'light' : 'dark';
}

function getAllPresets(customThemes: ThemePreset[]): ThemePreset[] {
  return [...BUILTIN_PRESETS, ...customThemes];
}

interface ThemeState {
  activeThemeId: string;
  customThemes: ThemePreset[];
  draftColors: ColorTokens | null;

  setActiveTheme: (id: string) => void;
  saveCustomTheme: (name: string, colors: ColorTokens, baseTheme: BaseTheme) => string;
  deleteCustomTheme: (id: string) => void;
  setDraftColors: (colors: ColorTokens | null) => void;
  updateDraftColor: (key: keyof ColorTokens, value: string) => void;
  getActivePreset: () => ThemePreset;
}

function migrateOldTheme(): string {
  const old = localStorage.getItem('markingdown-theme');
  if (old === 'dark') return 'tokyo-night';
  return 'warm-cream';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeThemeId: migrateOldTheme(),
      customThemes: [],
      draftColors: null,

      setActiveTheme: (id: string) => {
        set({ activeThemeId: id, draftColors: null });
      },

      saveCustomTheme: (name: string, colors: ColorTokens, baseTheme: BaseTheme) => {
        const id = nanoid();
        const preset: ThemePreset = { id, name, baseTheme, colors, builtIn: false };
        set((state) => ({
          customThemes: [...state.customThemes, preset],
          activeThemeId: id,
          draftColors: null,
        }));
        return id;
      },

      deleteCustomTheme: (id: string) => {
        set((state) => {
          const newCustom = state.customThemes.filter((t) => t.id !== id);
          const needsFallback = state.activeThemeId === id;
          return {
            customThemes: newCustom,
            activeThemeId: needsFallback ? 'warm-cream' : state.activeThemeId,
            draftColors: needsFallback ? null : state.draftColors,
          };
        });
      },

      setDraftColors: (colors: ColorTokens | null) => {
        set({ draftColors: colors });
      },

      updateDraftColor: (key: keyof ColorTokens, value: string) => {
        const { draftColors, getActivePreset } = get();
        const base = draftColors ?? { ...getActivePreset().colors };
        set({ draftColors: { ...base, [key]: value } });
      },

      getActivePreset: () => {
        const { activeThemeId, customThemes } = get();
        const all = getAllPresets(customThemes);
        return all.find((p) => p.id === activeThemeId) ?? BUILTIN_PRESETS[0];
      },
    }),
    {
      name: 'markingdown-themes',
      partialize: (state) => ({
        activeThemeId: state.activeThemeId,
        customThemes: state.customThemes,
      }),
    },
  ),
);
