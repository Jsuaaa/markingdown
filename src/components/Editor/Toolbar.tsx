import { useState, useRef, useEffect } from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  onImport: () => void;
  onSaveAs: () => void;
  onExportPDF: () => void;
  onExportHTML: () => void;
  onExportLaTeX: () => void;
}

export function Toolbar({ onImport, onSaveAs, onExportPDF, onExportHTML, onExportLaTeX }: ToolbarProps) {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSaveMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setShowSaveMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSaveMenu]);

  return (
    <div className={styles.toolbar}>
      <button className={styles.btn} onClick={onImport} title="Import .md file">
        Import
      </button>

      <div className={styles.separator} />

      <div className={styles.saveAsWrapper} ref={saveMenuRef}>
        <button
          className={styles.btn}
          onClick={() => setShowSaveMenu((prev) => !prev)}
          title="Save As..."
        >
          Save As
        </button>
        {showSaveMenu && (
          <div className={styles.dropdown}>
            <button className={styles.dropdownItem} onClick={() => { onSaveAs(); setShowSaveMenu(false); }}>
              Markdown (.md)
            </button>
            <button className={styles.dropdownItem} onClick={() => { onExportPDF(); setShowSaveMenu(false); }}>
              PDF (.pdf)
            </button>
            <button className={styles.dropdownItem} onClick={() => { onExportHTML(); setShowSaveMenu(false); }}>
              HTML (.html)
            </button>
            <button className={styles.dropdownItem} onClick={() => { onExportLaTeX(); setShowSaveMenu(false); }}>
              LaTeX (.tex)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
