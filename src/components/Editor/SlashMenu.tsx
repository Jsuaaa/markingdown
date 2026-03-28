import { useEffect, useRef } from 'react';
import type { SlashItem } from '../../editor/extensions/slashCommands';
import { slashCommandIcons } from './slashCommandIcons';
import styles from './SlashMenu.module.css';

export type { SlashItem };

const categoryOrder: SlashItem['category'][] = ['blocks', 'lists', 'inline', 'annotations'];
const categoryLabels: Record<SlashItem['category'], string> = {
  blocks: 'Blocks',
  lists: 'Lists',
  inline: 'Inline',
  annotations: 'Annotations',
};

function groupByCategory(items: SlashItem[]): { category: SlashItem['category']; items: SlashItem[] }[] {
  const groups: { category: SlashItem['category']; items: SlashItem[] }[] = [];
  for (const cat of categoryOrder) {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) groups.push({ category: cat, items: catItems });
  }
  return groups;
}

interface SlashMenuProps {
  items: SlashItem[];
  selectedIndex: number;
  visible: boolean;
  placement: 'above' | 'below';
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}

export function SlashMenu({ items, selectedIndex, visible, placement, onSelect, onHover }: SlashMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current?.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const menuClasses = [
    styles.menu,
    visible ? styles.visible : '',
    placement === 'above' ? styles.above : '',
  ].filter(Boolean).join(' ');

  if (items.length === 0) {
    return (
      <div className={menuClasses} ref={containerRef}>
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>No matching commands</div>
          <div className={styles.emptyHint}>Press Escape to close</div>
        </div>
      </div>
    );
  }

  const groups = groupByCategory(items);
  let flatIndex = 0;

  return (
    <div className={menuClasses} ref={containerRef}>
      {groups.map((group) => (
        <div key={group.category}>
          <div className={styles.categoryHeader}>
            {categoryLabels[group.category]}
          </div>
          {group.items.map((item) => {
            const idx = flatIndex++;
            return (
              <div
                key={item.command}
                data-index={idx}
                className={`${styles.item} ${idx === selectedIndex ? styles.selected : ''}`}
                onClick={() => onSelect(idx)}
                onMouseEnter={() => onHover(idx)}
              >
                <span
                  className={styles.icon}
                  dangerouslySetInnerHTML={{ __html: slashCommandIcons[item.command] ?? '' }}
                />
                <div className={styles.itemContent}>
                  <span className={styles.title}>{item.title}</span>
                  <span className={styles.description}>{item.description}</span>
                </div>
                {item.shortcut && (
                  <kbd className={styles.shortcut}>{item.shortcut}</kbd>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
