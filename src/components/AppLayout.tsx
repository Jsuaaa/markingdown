import type { ReactNode } from 'react';
import { TitleBar } from './TitleBar';

interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  title: string;
}

export function AppLayout({ sidebar, children, title }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <TitleBar title={title} />
      <div className="sidebar-container">
        {sidebar}
      </div>
      <div className="editor-area">
        {children}
      </div>
    </div>
  );
}
