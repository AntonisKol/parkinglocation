import type { Coordinates, SavedLocationResponse } from "../types";

export const getLocationKey = (
  location: Coordinates,
  timestamp: SavedLocationResponse["timestamp"],
): string =>
  [
    location.latitude,
    location.longitude,
    timestamp ?? "missing-timestamp",
  ].join(":");
