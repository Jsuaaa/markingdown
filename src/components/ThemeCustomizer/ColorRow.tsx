import { useRef } from 'react';

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorRow({ label, value, onChange }: ColorRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleHexChange = (hex: string) => {
    const clean = hex.startsWith('#') ? hex : '#' + hex;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      onChange(clean);
    }
  };

  return (
    <div className="color-row">
      <span className="color-row-label">{label}</span>
      <div className="color-row-controls">
        <button
          className="color-swatch"
          style={{ backgroundColor: value }}
          onClick={() => inputRef.current?.click()}
          title="Pick color"
        />
        <input
          ref={inputRef}
          type="color"
          className="color-input-native"
          value={value}
          onInput={(e) => onChange(e.currentTarget.value)}
        />
        <input
          type="text"
          className="color-hex-input"
          value={value}
          onChange={(e) => handleHexChange(e.target.value)}
          spellCheck={false}
          maxLength={7}
        />
      </div>
    </div>
  );
}
