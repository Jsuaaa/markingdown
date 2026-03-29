import { useState, useEffect } from 'react';
import {
  useThemeStore,
  BUILTIN_PRESETS,
  inferBaseTheme,
} from '../../store/themeStore';
import type { ColorTokens } from '../../store/themeStore';
import { ColorRow } from './ColorRow';
import { PresetCard } from './PresetCard';
import '../../styles/customizer.css';

interface ThemeCustomizerProps {
  onClose: () => void;
}

const COLOR_GROUPS: { title: string; keys: { key: keyof ColorTokens; label: string }[] }[] = [
  {
    title: 'Editor',
    keys: [
      { key: 'editorBg', label: 'Background' },
      { key: 'editorText', label: 'Text' },
      { key: 'headingText', label: 'Headings' },
    ],
  },
  {
    title: 'Chrome',
    keys: [
      { key: 'sidebarBg', label: 'Sidebar' },
      { key: 'sidebarText', label: 'Sidebar text' },
      { key: 'toolbarBg', label: 'Toolbar' },
      { key: 'toolbarText', label: 'Toolbar text' },
    ],
  },
  {
    title: 'Accents',
    keys: [
      { key: 'accent', label: 'Accent' },
      { key: 'codeBg', label: 'Code blocks' },
      { key: 'border', label: 'Borders' },
    ],
  },
];

export function ThemeCustomizer({ onClose }: ThemeCustomizerProps) {
  const activePreset = useThemeStore((s) => s.getActivePreset());
  const customThemes = useThemeStore((s) => s.customThemes);
  const draftColors = useThemeStore((s) => s.draftColors);
  const setActiveTheme = useThemeStore((s) => s.setActiveTheme);
  const updateDraftColor = useThemeStore((s) => s.updateDraftColor);
  const setDraftColors = useThemeStore((s) => s.setDraftColors);
  const saveCustomTheme = useThemeStore((s) => s.saveCustomTheme);
  const deleteCustomTheme = useThemeStore((s) => s.deleteCustomTheme);

  const [saving, setSaving] = useState(false);
  const [themeName, setThemeName] = useState('');

  const currentColors = draftColors ?? activePreset.colors;
  const allPresets = [...BUILTIN_PRESETS, ...customThemes];
  const hasDraft = draftColors !== null;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!themeName.trim()) return;
    const base = inferBaseTheme(currentColors.editorBg);
    saveCustomTheme(themeName.trim(), { ...currentColors }, base);
    setSaving(false);
    setThemeName('');
  };

  const handleReset = () => {
    setDraftColors(null);
  };

  return (
    <>
      <div className="customizer-backdrop" onClick={onClose} />
      <div className="customizer-drawer">
        <div className="customizer-header">
          <h3>Customize theme</h3>
          <button className="customizer-close" onClick={onClose} title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="customizer-body">
          <div className="customizer-section">
            <h4 className="customizer-section-title">Presets</h4>
            <div className="preset-grid">
              {allPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isActive={!hasDraft && activePreset.id === preset.id}
                  onSelect={() => setActiveTheme(preset.id)}
                  onDelete={preset.builtIn ? undefined : () => deleteCustomTheme(preset.id)}
                />
              ))}
            </div>
          </div>

          {COLOR_GROUPS.map((group) => (
            <div key={group.title} className="customizer-section">
              <h4 className="customizer-section-title">{group.title}</h4>
              {group.keys.map(({ key, label }) => (
                <ColorRow
                  key={key}
                  label={label}
                  value={currentColors[key]}
                  onChange={(v) => updateDraftColor(key, v)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="customizer-footer">
          {saving ? (
            <div className="save-inline">
              <input
                type="text"
                className="save-name-input"
                placeholder="Theme name..."
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <button className="save-confirm-btn" onClick={handleSave}>
                Save
              </button>
              <button className="save-cancel-btn" onClick={() => setSaving(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                className="customizer-btn customizer-btn-secondary"
                onClick={handleReset}
                disabled={!hasDraft}
              >
                Reset
              </button>
              <button
                className="customizer-btn customizer-btn-primary"
                onClick={() => setSaving(true)}
                disabled={!hasDraft}
              >
                Save as theme...
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
