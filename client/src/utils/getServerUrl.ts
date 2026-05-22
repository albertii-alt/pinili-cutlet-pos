export function getServerUrl(): string {
  const ip   = localStorage.getItem('server_ip')   ?? '';
  const port = localStorage.getItem('server_port') ?? '3001';
  return `https://${ip}:${port}`;
}

export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  return `${getServerUrl()}${imagePath}`;
}
