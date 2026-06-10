import {
  ErrorMessage,
  HeroSection,
  LocationStatus,
  RefreshPanel,
  UpdateLocationButton,
} from "./components";
import { useParkingLocation } from "./hooks";
import { formatLastUpdated } from "./utils";

const App = () => {
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

          <LocationStatus address={address} isLoading={isLoading} />
          <ErrorMessage message={error} />
          <UpdateLocationButton
            isUpdating={isUpdating}
            onUpdateLocation={() => void updateLocation()}
          />
        </div>

        <RefreshPanel lastUpdatedLabel={lastUpdatedLabel} />
      </section>
    </main>
  );
};

export default App;
