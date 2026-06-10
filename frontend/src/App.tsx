import { ErrorMessage } from "./components/ErrorMessage";
import { LocationStatus } from "./components/LocationStatus";
import { UpdateLocationButton } from "./components/UpdateLocationButton";
import { useParkingLocation } from "./hooks/useParkingLocation";

export default function App() {
  const {
    address,
    error,
    isLoading,
    isUpdating,
    updateLocation,
  } = useParkingLocation();

  return (
    <main className="app-shell">
      <section className="card">
        <div className="content">
          
          <LocationStatus address={address} isLoading={isLoading} />
          <ErrorMessage message={error} />
          <UpdateLocationButton
            isUpdating={isUpdating}
            onUpdateLocation={() => void updateLocation()}
          />
        </div>      
      </section>
    </main>
  );
}
