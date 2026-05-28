import apiClient from './client';

export interface BackupFile {
  filename: string;
  size: number;
  created_at: string;
}

export async function listBackups(): Promise<BackupFile[]> {
  const { data } = await apiClient.get('/api/backup/list');
  return data;
}

export async function deleteBackup(filename: string): Promise<void> {
  await apiClient.delete(`/api/backup/${filename}`);
}

export async function configAutoBackup(enabled: boolean, time: string): Promise<void> {
  await apiClient.post('/api/backup/auto-config', { enabled, time });
}

// Returns the download URL for a named backup file (used with Tauri fetch)
export function getBackupDownloadUrl(filename: string): string {
  return `${import.meta.env.VITE_API_URL}/api/backup/download/${filename}`;
}

// Returns the manual backup download URL (streams the live DB)
export function getManualBackupUrl(): string {
  return `${import.meta.env.VITE_API_URL}/api/backup/create`;
}

// Upload a .db file to restore
export async function restoreBackup(file: File): Promise<void> {
  const form = new FormData();
  form.append('db', file);
  await apiClient.post('/api/backup/restore', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
