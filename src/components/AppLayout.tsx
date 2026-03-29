import type { ReactNode } from 'react';
import { TitleBar } from './TitleBar';

interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  title: string;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
  onOpenCustomizer: () => void;
  themeCustomizer?: ReactNode;
}

export function AppLayout({
  sidebar,
  children,
  title,
  sidebarWidth,
  sidebarCollapsed,
  onToggleSidebar,
  onResizeStart,
  onOpenCustomizer,
  themeCustomizer,
}: AppLayoutProps) {
  const columns = sidebarCollapsed ? '0px 1fr' : `${sidebarWidth}px 1fr`;

  return (
    <div className="app-layout" style={{ gridTemplateColumns: columns }}>
      <TitleBar title={title} onToggleSidebar={onToggleSidebar} sidebarCollapsed={sidebarCollapsed} onOpenCustomizer={onOpenCustomizer} />
      <div className={`sidebar-container${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {sidebar}
        {!sidebarCollapsed && (
          <div className="sidebar-resize-handle" onMouseDown={onResizeStart} />
        )}
      </div>
      <div className="editor-area">
        {children}
      </div>
      {themeCustomizer}
    </div>
  );
}
