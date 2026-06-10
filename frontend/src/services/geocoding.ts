import { GEOCODE_TIMEOUT_MS } from "../config";
import type { Coordinates } from "../types";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
};

type NominatimResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

export const formatCoordinates = (location: Coordinates): string =>
  `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;

const fetchWithTimeout = async (
  url: URL,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const formatAddress = (
  data: NominatimResponse,
  location: Coordinates,
): string => {
  const address = data.address ?? {};
  const street = address.road ?? address.pedestrian ?? address.footway;
  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county;
  const addressParts = [street, address.house_number, city].filter(Boolean);

  return addressParts.length > 0
    ? addressParts.join(" - ")
    : data.display_name || formatCoordinates(location);
};

export const reverseGeocode = async (
  location: Coordinates,
): Promise<string> => {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(location.latitude));
  url.searchParams.set("lon", String(location.longitude));

  const response = await fetchWithTimeout(url, GEOCODE_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  return formatAddress((await response.json()) as NominatimResponse, location);
};

export const describeLocation = async (
  location: Coordinates,
): Promise<string> => {
  try {
    return await reverseGeocode(location);
  } catch {
    return formatCoordinates(location);
  }
};
