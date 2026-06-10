type RefreshPanelProps = {
  lastUpdatedLabel: string;
};

export function RefreshPanel({ lastUpdatedLabel }: RefreshPanelProps) {
  return (
    <aside className="refresh-panel" aria-label="Refresh status">
      <div className="refresh-panel-spacer" />
      <div className="refresh-panel-footer">
        <p>Auto-refreshes every second</p>
        <time>{lastUpdatedLabel}</time>
      </div>
    </aside>
  );
}
