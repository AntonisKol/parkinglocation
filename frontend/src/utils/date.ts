export function formatLastUpdated(timestamp: number | null): string {
  if (!timestamp) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000));
}
