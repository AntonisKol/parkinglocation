type LocationStatusProps = {
  address: string;
  isLoading: boolean;
};

export const LocationStatus = ({ address, isLoading }: LocationStatusProps) => (
  <div className="status-panel" aria-live="polite">
    <span className="label">Saved car location</span>
    <strong>{isLoading ? "Loading saved location..." : address}</strong>
  </div>
);
