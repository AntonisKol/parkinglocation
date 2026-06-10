export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type SavedLocationResponse = {
  latitude: number | null;
  longitude: number | null;
  timestamp: number | null;
};
