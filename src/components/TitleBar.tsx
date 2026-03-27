interface TitleBarProps {
  title: string;
}

export function TitleBar({ title }: TitleBarProps) {
  return (
    <div className="titlebar">
      <div className="titlebar-traffic-pad" />
      <span className="titlebar-title">{title}</span>
    </div>
  );
}
