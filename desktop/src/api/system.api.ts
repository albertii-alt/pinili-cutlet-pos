import apiClient from './client';

export interface SystemUptime {
  ms: number;
  seconds: number;
  days: number;
  hours: number;
  minutes: number;
  secs: number;
}

export interface SystemStatus {
  uptime: SystemUptime;
  database: {
    sizeBytes: number;
    path: string;
  };
  backup: {
    lastBackupAt: string | null;
    lastBackupFile: string | null;
  };
  connections: {
    connectedClients: number;
  };
  system: {
    platform: string;
    arch: string;
    nodeVersion: string;
    totalMemBytes: number;
    freeMemBytes: number;
    usedMemBytes: number;
    memUsagePct: number;
    cpuLoad1m: number;
    cpuCount: number;
    processMemBytes: number;
    hostname: string;
  };
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const { data } = await apiClient.get('/api/system/status');
  return data;
}
