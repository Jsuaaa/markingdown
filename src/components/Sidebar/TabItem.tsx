import { useState, useRef, useEffect } from 'react';
import type { Plan } from '../../store/types';
import styles from './Sidebar.module.css';

interface TabItemProps {
  plan: Plan;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  onRename: (title: string) => void;
}

export function TabItem({ plan, isActive, onSelect, onClose, onRename }: TabItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(plan.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== plan.title) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(plan.title);
    setEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitRename();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  return (
    <div
      className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
      onClick={onSelect}
    >
      {editing ? (
        <input
          ref={inputRef}
          className={styles.tabTitleInput}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={styles.tabTitle} onDoubleClick={handleDoubleClick}>
          {plan.title}
        </span>
      )}
      {plan.isDirty && !editing && <span className={styles.dirtyDot} />}
      <button
        className={styles.closeBtn}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="Close plan"
      >
        ×
      </button>
    </div>
  );
}
