import type { ThemePreset } from '../../store/themeStore';

interface PresetCardProps {
  preset: ThemePreset;
  isActive: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export function PresetCard({ preset, isActive, onSelect, onDelete }: PresetCardProps) {
  const { colors } = preset;
  const swatches = [colors.editorBg, colors.sidebarBg, colors.accent, colors.editorText];

  return (
    <button
      className={`preset-card${isActive ? ' preset-card-active' : ''}`}
      onClick={onSelect}
      title={preset.name}
    >
      <div className="preset-swatches">
        {swatches.map((c, i) => (
          <span key={i} className="preset-swatch" style={{ backgroundColor: c }} />
        ))}
      </div>
      <span className="preset-name">{preset.name}</span>
      {onDelete && (
        <button
          className="preset-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete theme"
        >
          &times;
        </button>
      )}
    </button>
  );
}
