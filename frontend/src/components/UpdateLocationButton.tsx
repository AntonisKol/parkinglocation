type UpdateLocationButtonProps = {
  isUpdating: boolean;
  onUpdateLocation: () => void;
};

export const UpdateLocationButton = ({
  isUpdating,
  onUpdateLocation,
}: UpdateLocationButtonProps) => (
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
