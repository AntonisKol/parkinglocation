import type { Coordinates, SavedLocationResponse } from "../types";

export function getLocationKey(
  location: Coordinates,
  timestamp: SavedLocationResponse["timestamp"],
): string {
  return [
    location.latitude,
    location.longitude,
    timestamp ?? "missing-timestamp",
  ].join(":");
}
