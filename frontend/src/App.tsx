import { ErrorMessage } from "./components/ErrorMessage";
import { HeroSection } from "./components/HeroSection";
import { LocationStatus } from "./components/LocationStatus";
import { RefreshPanel } from "./components/RefreshPanel";
import { UpdateLocationButton } from "./components/UpdateLocationButton";
import { useParkingLocation } from "./hooks/useParkingLocation";
import { formatLastUpdated } from "./utils/date";

export default function App() {
  const {
    address,
    error,
    isLoading,
    isUpdating,
    lastUpdated,
    updateLocation,
  } = useParkingLocation();
  const lastUpdatedLabel = formatLastUpdated(lastUpdated);

  return (
    <main className="app-shell">
      <section className="card">
        <div className="content">
          <HeroSection />
          <LocationStatus address={address} isLoading={isLoading} />
          <ErrorMessage message={error} />
          <UpdateLocationButton
            isUpdating={isUpdating}
            onUpdateLocation={() => void updateLocation()}
          />

          <p className="hint">
            The page checks for changes every second, so a newly saved location
            appears automatically on another open phone or browser.
          </p>
        </div>

        <RefreshPanel lastUpdatedLabel={lastUpdatedLabel} />
      </section>
    </main>
  );
}
