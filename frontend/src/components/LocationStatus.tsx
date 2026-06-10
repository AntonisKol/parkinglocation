type LocationStatusProps = {
  address: string;
  isLoading: boolean;
};

export function LocationStatus({ address, isLoading }: LocationStatusProps) {
  return (
    <div className="status-panel" aria-live="polite">
      <span className="label">Saved car location</span>
      <strong>{isLoading ? "Loading saved location..." : address}</strong>
    </div>
  );
}
