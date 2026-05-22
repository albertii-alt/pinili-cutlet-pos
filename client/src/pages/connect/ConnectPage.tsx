import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconWifi, IconQrcode, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { updateBaseURL } from '../../api/client';
import { reconnectSocket } from '../../socket/socket';
import { useAuthStore } from '../../store/useAuthStore';

export default function ConnectPage({ error: initialError }: { error?: string }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [ip, setIp]       = useState(localStorage.getItem('server_ip') ?? '');
  const [port, setPort]   = useState(localStorage.getItem('server_port') ?? '3001');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(initialError ?? '');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);

  // Start QR scanner
  async function startScanner() {
    setScanning(true);
    setError('');

    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('qr-reader');
    html5QrRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Expected format: http://192.168.1.7:3000
          try {
            const url = new URL(decodedText);
            const scannedIp   = url.hostname;
            const scannedPort = url.port || '3000';
            setIp(scannedIp);
            setPort(scannedPort);
            stopScanner();
            handleConnect(scannedIp, scannedPort);
          } catch {
            setError('Invalid QR code. Please try again.');
            stopScanner();
          }
        },
        () => { /* ignore scan failures */ }
      );
    } catch {
      setError('Camera access denied. Enter IP manually.');
      setScanning(false);
    }
  }

  async function stopScanner() {
    const scanner = html5QrRef.current as { stop: () => Promise<void> } | null;
    if (scanner) {
      try { await scanner.stop(); } catch { /* ignore */ }
      html5QrRef.current = null;
    }
    setScanning(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  async function handleConnect(overrideIp?: string, overridePort?: string) {
    const targetIp   = overrideIp   ?? ip.trim();
    const targetPort = overridePort ?? port.trim();

    if (!targetIp) {
      setError('Please enter the server IP address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.get(`https://${targetIp}:${targetPort}/health`, { timeout: 5000 });

      // Save to localStorage
      localStorage.setItem('server_ip', targetIp);
      localStorage.setItem('server_port', targetPort);

      // Update Axios and socket instances
      updateBaseURL(targetIp, targetPort);
      reconnectSocket(targetIp, targetPort);

      // Redirect based on auth state
      if (isAuthenticated) {
        navigate(user?.role === 'kitchen' ? '/queue' : '/order');
      } else {
        navigate('/login');
      }
    } catch {
      setError('Could not connect. Check the IP and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-[360px] p-6 flex flex-col gap-5">
        {/* Brand */}
        <div className="text-center">
          <h1 className="font-bold tracking-widest text-xl">
            <span className="text-white">PINILI</span>{' '}
            <span className="text-primary">CUTLET</span>
          </h1>
          <p className="text-textGray text-xs mt-1">Connect to Server</p>
        </div>

        {/* QR Scanner */}
        {scanning ? (
          <div className="flex flex-col gap-3">
            <div id="qr-reader" ref={scannerRef} className="w-full rounded-xl overflow-hidden" />
            <button
              onClick={stopScanner}
              className="flex items-center justify-center gap-2 bg-card border border-border text-textGray rounded-lg py-2.5 text-sm"
            >
              <IconX size={15} />
              Cancel Scan
            </button>
          </div>
        ) : (
          <>
            {/* IP + Port fields */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-textGray text-xs">Server IP Address</label>
                <input
                  value={ip}
                  onChange={e => setIp(e.target.value)}
                  placeholder="e.g. 192.168.1.7"
                  className="bg-cardLight border border-border rounded-lg px-3 py-3 text-white text-base placeholder:text-textMuted focus:border-primary outline-none min-h-[44px]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-textGray text-xs">Port</label>
                <input
                  value={port}
                  onChange={e => setPort(e.target.value)}
                  placeholder="3000"
                  className="bg-cardLight border border-border rounded-lg px-3 py-3 text-white text-base placeholder:text-textMuted focus:border-primary outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Error */}
            <p className="text-danger text-xs min-h-[16px] -mt-2">{error}</p>

            {/* Connect button */}
            <button
              onClick={() => handleConnect()}
              disabled={loading}
              className="w-full bg-primary hover:bg-primaryDark disabled:bg-cardLight disabled:text-textMuted text-white rounded-lg py-3 text-base font-semibold min-h-[44px] flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <IconWifi size={18} />
                  Connect
                </>
              )}
            </button>

            {/* QR scan button */}
            <button
              onClick={startScanner}
              className="w-full bg-card border border-border text-textGray rounded-lg py-3 text-sm min-h-[44px] flex items-center justify-center gap-2 hover:bg-cardLight transition-colors"
            >
              <IconQrcode size={18} />
              Scan QR Code
            </button>
          </>
        )}
      </div>
    </div>
  );
}
