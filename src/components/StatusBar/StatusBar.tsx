import { wordCount, charCount } from '../../utils/markdownHelpers';
import styles from './StatusBar.module.css';

interface StatusBarProps {
  markdown: string;
}

export function StatusBar({ markdown }: StatusBarProps) {
  const words = wordCount(markdown);
  const chars = charCount(markdown);

  return (
    <div className={styles.statusBar}>
      <div className={styles.stats}>
        <span>{words} words</span>
        <span>{chars} chars</span>
      </div>
    </div>
  );
}
