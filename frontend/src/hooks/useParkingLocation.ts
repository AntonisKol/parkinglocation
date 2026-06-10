import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSavedLocation,
  isApiError,
  isSavedLocation,
  LOCATION_SERVICE_UNAVAILABLE,
  SAVE_LOCATION_UNAVAILABLE,
  saveLocation,
} from "../api";
import { FAILED_REFRESH_INTERVAL_MS, REFRESH_INTERVAL_MS } from "../config";
import { describeLocation, getBrowserLocation } from "../services";
import type { Coordinates } from "../types";
import { getLocationKey } from "../utils";

type ParkingLocationState = {
  address: string;
  error: string | null;
  isLoading: boolean;
  isUpdating: boolean;
  lastUpdated: number | null;
  updateLocation: () => Promise<void>;
};

const EMPTY_LOCATION_ADDRESS = "No parking location saved yet";
const UNLOADED_LOCATION_ADDRESS = "No saved location loaded yet";

export const useParkingLocation = (): ParkingLocationState => {
  const [address, setAddress] = useState(EMPTY_LOCATION_ADDRESS);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const lastLocationKeyRef = useRef<string | null>(null);
  const refreshInFlightRef = useRef(false);
  const refreshTimerRef = useRef<number | undefined>(undefined);
  const isMountedRef = useRef(true);

  const applyLocation = useCallback(
    async (location: Coordinates, timestamp: number | null) => {
      const locationKey = getLocationKey(location, timestamp);

      setLastUpdated(timestamp);

      if (locationKey !== lastLocationKeyRef.current) {
        lastLocationKeyRef.current = locationKey;
        setAddress(await describeLocation(location));
      }
    },
    [],
  );

  const loadSavedLocation = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const savedLocation = await fetchSavedLocation();
        setError((currentError) =>
          currentError === LOCATION_SERVICE_UNAVAILABLE ? null : currentError,
        );

        if (isSavedLocation(savedLocation)) {
          await applyLocation(
            {
              latitude: savedLocation.latitude,
              longitude: savedLocation.longitude,
            },
            savedLocation.timestamp,
          );
        } else {
          lastLocationKeyRef.current = null;
          setLastUpdated(null);
          setAddress(EMPTY_LOCATION_ADDRESS);
        }

        return true;
      } catch {
        setError(LOCATION_SERVICE_UNAVAILABLE);

        if (!lastLocationKeyRef.current) {
          setAddress(UNLOADED_LOCATION_ADDRESS);
        }

        return false;
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [applyLocation],
  );

  const refresh = useCallback(
    async (showLoading = false) => {
      if (refreshInFlightRef.current) {
        return;
      }

      refreshInFlightRef.current = true;

      try {
        const refreshSucceeded = await loadSavedLocation(showLoading);
        const nextRefreshDelay = refreshSucceeded
          ? REFRESH_INTERVAL_MS
          : FAILED_REFRESH_INTERVAL_MS;

        if (isMountedRef.current) {
          refreshTimerRef.current = window.setTimeout(() => {
            void refresh();
          }, nextRefreshDelay);
        }
      } finally {
        refreshInFlightRef.current = false;
      }
    },
    [loadSavedLocation],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void refresh(true);

    return () => {
      isMountedRef.current = false;

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [refresh]);

  const updateLocation = useCallback(async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const location = await getBrowserLocation();
      const savedLocation = await saveLocation(location);
      const timestamp = savedLocation.timestamp ?? Math.floor(Date.now() / 1000);

      await applyLocation(location, timestamp);
    } catch (locationError) {
      if (isApiError(locationError)) {
        setError(SAVE_LOCATION_UNAVAILABLE);
      } else if (locationError instanceof Error && locationError.message) {
        setError(locationError.message);
      } else {
        setError("Failed to update location. Check the backend and try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  }, [applyLocation]);

  return {
    address,
    error,
    isLoading,
    isUpdating,
    lastUpdated,
    updateLocation,
  };
};
