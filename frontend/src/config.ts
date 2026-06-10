export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ?? (import.meta.env.DEV ? "/api" : "");

export const REFRESH_INTERVAL_MS = 1000;
export const FAILED_REFRESH_INTERVAL_MS = 30000;
export const API_TIMEOUT_MS = 8000;
export const GEOCODE_TIMEOUT_MS = 5000;
export const GEOLOCATION_TIMEOUT_MS = 10000;
