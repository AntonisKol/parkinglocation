import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import L, { type LatLngTuple, type LeafletMouseEvent } from "leaflet";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "https://backend-adwr.onrender.com";

const DEFAULT_LOCATION: Coordinates = {
  latitude: 51.505,
  longitude: -0.09,
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SavedLocationResponse = {
  latitude: number | null;
  longitude: number | null;
  timestamp: number | null;
};

type LocationMapProps = {
  location: Coordinates | null;
  selectable: boolean;
  onChange?: (location: Coordinates) => void;
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

const api = axios.create({
  baseURL: BACKEND_URL,
});

function isSavedLocation(value: SavedLocationResponse): value is {
  latitude: number;
  longitude: number;
  timestamp: number | null;
} {
  return typeof value.latitude === "number" && typeof value.longitude === "number";
}

function toLatLng(location: Coordinates): LatLngTuple {
  return [location.latitude, location.longitude];
}

function formatCoordinates(location: Coordinates): string {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

async function reverseGeocode(location: Coordinates): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(location.latitude));
  url.searchParams.set("lon", String(location.longitude));

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const data = await response.json();
  const address = data.address ?? {};
  const street = [
    address.house_number,
    address.road ?? address.pedestrian ?? address.footway,
  ]
    .filter(Boolean)
    .join(" ");
  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county;
  const shortAddress = [street, city].filter(Boolean).join(", ");

  return shortAddress || data.display_name || formatCoordinates(location);
}

async function describeLocation(location: Coordinates): Promise<string> {
  try {
    return await reverseGeocode(location);
  } catch {
    return formatCoordinates(location);
  }
}

function getBrowserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        reject(new Error("Unable to read your current location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  });
}

function LocationMap({ location, selectable, onChange }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const initialLocation = location ?? DEFAULT_LOCATION;
    const map = L.map(containerRef.current).setView(
      toLatLng(initialLocation),
      location ? 16 : 3,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [location]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectable || !onChange) {
      return;
    }

    const handleClick = (event: LeafletMouseEvent) => {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [onChange, selectable]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markerRef.current?.remove();
    markerRef.current = null;

    if (!location) {
      map.setView(toLatLng(DEFAULT_LOCATION), 3);
      return;
    }

    const marker = L.marker(toLatLng(location), {
      draggable: selectable,
    }).addTo(map);

    marker.bindPopup(
      selectable ? "Drag the marker or click the map." : "Saved car location",
    );

    if (selectable && onChange) {
      marker.on("dragend", () => {
        const markerLocation = marker.getLatLng();
        onChange({
          latitude: markerLocation.lat,
          longitude: markerLocation.lng,
        });
      });
    }

    map.setView(toLatLng(location), Math.max(map.getZoom(), 15));
    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [location, onChange, selectable]);

  return <div ref={containerRef} className="map" />;
}

export default function App() {
  const [savedLocation, setSavedLocation] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(
    null,
  );
  const [address, setAddress] = useState("No parking location saved yet");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSavedLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<SavedLocationResponse>("/car-location");

      if (isSavedLocation(response.data)) {
        const location = {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        };

        setSavedLocation(location);
        setAddress(await describeLocation(location));
      } else {
        setSavedLocation(null);
        setAddress("No parking location saved yet");
      }
    } catch {
      setError("Backend not reachable. Check the API URL and try again.");
      setAddress("Backend not reachable");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSavedLocation();
  }, [loadSavedLocation]);

  const updateSelectedLocation = useCallback((location: Coordinates) => {
    setSelectedLocation(location);
  }, []);

  const startSelectingLocation = () => {
    setError(null);
    setSelectedLocation(savedLocation ?? DEFAULT_LOCATION);
    setIsEditing(true);
  };

  const useCurrentLocation = async () => {
    setIsLocating(true);
    setError(null);

    try {
      const location = await getBrowserLocation();
      setSelectedLocation(location);
      setIsEditing(true);
    } catch (locationError) {
      setError(
        locationError instanceof Error
          ? locationError.message
          : "Unable to read your current location.",
      );
    } finally {
      setIsLocating(false);
    }
  };

  const confirmLocation = async () => {
    if (!selectedLocation) {
      setError("Choose a location before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await api.post("/car-location", selectedLocation);
      setSavedLocation(selectedLocation);
      setAddress(await describeLocation(selectedLocation));
      setIsEditing(false);
    } catch {
      setError("Failed to save location. Check the backend and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelSelection = () => {
    setIsEditing(false);
    setSelectedLocation(null);
    setError(null);
  };

  const activeLocation = isEditing ? selectedLocation : savedLocation;

  return (
    <main className="app-shell">
      <section className="card">
        <div className="content">
          <p className="eyebrow">Where is the car parked?</p>
          <h1>Track your saved parking spot</h1>
          <p className="description">
            Save your car location to the backend, use your browser location, or
            click the map to pick a parking spot manually.
          </p>

          <div className="status-panel" aria-live="polite">
            <span className="label">Current location</span>
            <strong>{isLoading ? "Loading saved location..." : address}</strong>
            {savedLocation ? (
              <span className="coordinates">{formatCoordinates(savedLocation)}</span>
            ) : null}
          </div>

          {error ? <p className="error">{error}</p> : null}

          <div className="actions">
            {isEditing ? (
              <>
                <button
                  className="primary-button"
                  type="button"
                  onClick={confirmLocation}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Confirm location"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={cancelSelection}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="primary-button"
                  type="button"
                  onClick={startSelectingLocation}
                  disabled={isLoading}
                >
                  Select on map
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isLoading || isLocating}
                >
                  {isLocating ? "Locating..." : "Use my current location"}
                </button>
              </>
            )}
          </div>

          {isEditing ? (
            <p className="hint">
              Click anywhere on the map or drag the marker, then confirm to save
              the new parking spot.
            </p>
          ) : null}
        </div>

        <div className="map-panel">
          <LocationMap
            location={activeLocation}
            selectable={isEditing}
            onChange={updateSelectedLocation}
          />
        </div>
      </section>
    </main>
  );
}
