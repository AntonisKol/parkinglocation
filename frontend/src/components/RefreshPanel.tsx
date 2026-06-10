type RefreshPanelProps = {
  lastUpdatedLabel: string;
};

export const RefreshPanel = ({ lastUpdatedLabel }: RefreshPanelProps) => (
  <aside className="refresh-panel" aria-label="Refresh status">
    <div className="refresh-panel-spacer" />
    <div className="refresh-panel-footer">
      <p>Auto-refreshes every second</p>
      <time>{lastUpdatedLabel}</time>
    </div>
  </aside>
);
