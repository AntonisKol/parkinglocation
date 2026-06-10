import axios from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "../config";
import type { Coordinates, SavedLocationResponse } from "../types";

export const LOCATION_SERVICE_UNAVAILABLE =
  "Location service unavailable. Start the backend or configure VITE_BACKEND_URL.";

export const SAVE_LOCATION_UNAVAILABLE =
  "Could not save location because the location service is unavailable.";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

export const isSavedLocation = (value: SavedLocationResponse): value is {
  latitude: number;
  longitude: number;
  timestamp: number | null;
} => typeof value.latitude === "number" && typeof value.longitude === "number";

export const isApiError = (error: unknown): boolean => axios.isAxiosError(error);

export const fetchSavedLocation =
  async (): Promise<SavedLocationResponse> => {
  const response = await api.get<SavedLocationResponse>("/car-location");

  return response.data;
};

export const saveLocation = async (
  location: Coordinates,
): Promise<SavedLocationResponse> => {
  const response = await api.post<SavedLocationResponse>(
    "/car-location",
    location,
  );

  return response.data;
};
