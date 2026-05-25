import { useState, useEffect, useRef } from 'react';
import { getSettings } from '../api/settings.api';
import socket from '../socket/socket';

const SERVER_PORT = 3000;

// Shared AudioContext — created once, reused for all sounds.
// iOS requires it to be resumed inside a user gesture before it can play anything.
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
  return sharedCtx;
}

function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();
}

function playBeep(ctx: AudioContext) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
}

export function useNotificationSound() {
  const [enabled, setEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const soundFileRef          = useRef('');

  // Unlock AudioContext on first user tap anywhere on the page
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('click',      unlock, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click',      unlock);
    };
  }, []);

  useEffect(() => {
    getSettings()
      .then(s => {
        setEnabled(s.notification_enabled !== 'false');
        soundFileRef.current = s.notification_sound ?? '';
      })
      .catch(() => {});

    function handleSettingsUpdated({ key, value }: { key: string; value: string }) {
      if (key === 'notification_enabled') setEnabled(value !== 'false');
      if (key === 'notification_sound')   soundFileRef.current = value;
    }
    socket.on('settings:updated', handleSettingsUpdated);
    return () => { socket.off('settings:updated', handleSettingsUpdated); };
  }, []);

  function playSound(role?: string) {
    if (role !== 'kitchen') return;
    if (!enabled || isMuted) return;
    const ctx      = getAudioContext();
    const filename = soundFileRef.current;

    const doPlay = () => {
      if (filename) {
        const url   = `http://${window.location.hostname}:${SERVER_PORT}/sounds/${filename}`;
        const audio = new Audio(url);
        audio.play().catch(() => playBeep(ctx));
      } else {
        playBeep(ctx);
      }
    };

    // If still suspended (user hasn't tapped yet), resume first then play
    if (ctx.state === 'suspended') {
      ctx.resume().then(doPlay).catch(() => {});
    } else {
      doPlay();
    }
  }

  function toggleMute() {
    setIsMuted(m => !m);
  }

  return { playSound, enabled, toggleMute, isMuted };
}
