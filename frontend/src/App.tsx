import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "https://backend-adwr.onrender.com";

const REFRESH_INTERVAL_MS = 1000;
const FAILED_REFRESH_INTERVAL_MS = 5000;
const API_TIMEOUT_MS = 8000;
const GEOCODE_TIMEOUT_MS = 5000;

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SavedLocationResponse = {
  latitude: number | null;
  longitude: number | null;
  timestamp: number | null;
};

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: API_TIMEOUT_MS,
});

function isSavedLocation(value: SavedLocationResponse): value is {
  latitude: number;
  longitude: number;
  timestamp: number | null;
} {
  return typeof value.latitude === "number" && typeof value.longitude === "number";
}

function formatCoordinates(location: Coordinates): string {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

async function reverseGeocode(location: Coordinates): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(location.latitude));
  url.searchParams.set("lon", String(location.longitude));

  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, GEOCODE_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }

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

export default function App() {
  const [savedLocation, setSavedLocation] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState("No parking location saved yet");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const lastLocationKeyRef = useRef<string | null>(null);
  const refreshInFlightRef = useRef(false);

  const loadSavedLocation = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const response = await api.get<SavedLocationResponse>("/car-location");
      setError((currentError) =>
        currentError === "Backend not reachable. Check the API URL and try again."
          ? null
          : currentError,
      );

      if (isSavedLocation(response.data)) {
        const location = {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        };
        const locationKey = [
          location.latitude,
          location.longitude,
          response.data.timestamp ?? "missing-timestamp",
        ].join(":");

        setSavedLocation(location);
        setLastUpdated(response.data.timestamp);

        if (locationKey !== lastLocationKeyRef.current) {
          lastLocationKeyRef.current = locationKey;
          setAddress(await describeLocation(location));
        }
      } else {
        lastLocationKeyRef.current = null;
        setSavedLocation(null);
        setLastUpdated(null);
        setAddress("No parking location saved yet");
      }
      return true;
    } catch {
      setError("Backend not reachable. Check the API URL and try again.");
      if (!lastLocationKeyRef.current) {
        setAddress("Backend not reachable");
      }
      return false;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let refreshTimer: number | undefined;
    let isCancelled = false;

    const refresh = async (showLoading = false) => {
      if (refreshInFlightRef.current) {
        return;
      }

      refreshInFlightRef.current = true;

      try {
        const refreshSucceeded = await loadSavedLocation(showLoading);
        const nextRefreshDelay = refreshSucceeded
          ? REFRESH_INTERVAL_MS
          : FAILED_REFRESH_INTERVAL_MS;

        if (!isCancelled) {
          refreshTimer = window.setTimeout(() => {
            void refresh();
          }, nextRefreshDelay);
        }
      } finally {
        refreshInFlightRef.current = false;
      }
    };

    void refresh(true);

    return () => {
      isCancelled = true;

      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }
    };
  }, [loadSavedLocation]);

  const updateLocation = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const location = await getBrowserLocation();
      const response = await api.post<SavedLocationResponse>(
        "/car-location",
        location,
      );
      const savedTimestamp = response.data.timestamp ?? Math.floor(Date.now() / 1000);
      const locationKey = [
        location.latitude,
        location.longitude,
        savedTimestamp,
      ].join(":");

      lastLocationKeyRef.current = locationKey;
      setSavedLocation(location);
      setLastUpdated(savedTimestamp);
      setAddress(await describeLocation(location));
    } catch (locationError) {
      if (axios.isAxiosError(locationError)) {
        setError("Failed to update location. Check the backend and try again.");
      } else if (locationError instanceof Error && locationError.message) {
        setError(locationError.message);
      } else {
        setError("Failed to update location. Check the backend and try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lastUpdated * 1000))
    : "Not saved yet";

  return (
    <main className="app-shell">
      <section className="card">
        <div className="content">
          <p className="eyebrow">Where is the car parked?</p>
          <h1>Share your parking spot</h1>
          <p className="description">
            Open this link after parking and tap one button. Anyone else with
            the page open will see the saved address refresh automatically.
          </p>

          <div className="status-panel" aria-live="polite">
            <span className="label">Saved car location</span>
            <strong>{isLoading ? "Loading saved location..." : address}</strong>
            {savedLocation ? (
              <span className="coordinates">Updated {lastUpdatedLabel}</span>
            ) : null}
          </div>

          {error ? <p className="error">{error}</p> : null}

          <div className="actions">
            <button
              className="primary-button"
              type="button"
              onClick={updateLocation}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update location"}
            </button>
          </div>

          <p className="hint">
            The page checks for changes every second, so a newly saved location
            appears automatically on another open phone or browser.
          </p>
        </div>

        <div className="confirmation-panel" aria-label="Location confirmation">
          <span className="panel-label">Visual confirmation</span>
          <p className="confirmation-address">
            {isLoading ? "Loading saved location..." : address}
          </p>
          <div className="confirmation-meta">
            <span>Auto-refreshes every second</span>
            <span>{lastUpdatedLabel}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
