import { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { QRCode } from 'react-qrcode-logo';
import apiClient from '../../api/client';

interface QRCodeModalProps {
  onClose: () => void;
}

interface NetworkInfo {
  ip: string;
  port: number;
}

export default function QRCodeModal({ onClose }: QRCodeModalProps) {
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    apiClient.get<NetworkInfo>('/api/network/ip')
      .then(res => setNetwork(res.data))
      .catch(() => setError('Could not fetch server IP'));
  }, []);

  const serverURL = network ? `http://${network.ip}:${network.port}` : '';

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl w-[360px]">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-white font-semibold">Connect Phone</h2>
          <button onClick={onClose} className="text-textGray hover:text-white transition-colors">
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center gap-4">
          {error ? (
            <p className="text-danger text-sm text-center">{error}</p>
          ) : !network ? (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <QRCode
                value={serverURL}
                size={200}
                bgColor="#1A1A1A"
                fgColor="#FFFFFF"
                qrStyle="dots"
                eyeRadius={6}
              />
              <div className="flex flex-col items-center gap-1">
                <p className="text-white font-mono text-sm">{serverURL}</p>
                <p className="text-textMuted text-xs text-center">
                  Scan this QR code on your phone to connect
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
