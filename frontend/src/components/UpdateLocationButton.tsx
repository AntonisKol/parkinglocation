type UpdateLocationButtonProps = {
  isUpdating: boolean;
  onUpdateLocation: () => void;
};

export function UpdateLocationButton({
  isUpdating,
  onUpdateLocation,
}: UpdateLocationButtonProps) {
  return (
    <div className="actions">
      <button
        className="primary-button"
        type="button"
        onClick={onUpdateLocation}
        disabled={isUpdating}
      >
        {isUpdating ? "Updating..." : "Update location"}
      </button>
    </div>
  );
}
