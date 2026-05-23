const SERVER_PORT = 3000;

export function getServerUrl(): string {
  return `http://${window.location.hostname}:${SERVER_PORT}`;
}

export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  return `${getServerUrl()}${imagePath}`;
}
