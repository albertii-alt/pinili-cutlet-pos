import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDone: () => void;
}

export default function Toast({ message, type = 'success', duration = 3000, onDone }: ToastProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    // enter → show after expand animation
    const t1 = setTimeout(() => setPhase('show'), 50);
    // show → exit before duration ends
    const t2 = setTimeout(() => setPhase('exit'), duration - 400);
    // exit → unmount
    const t3 = setTimeout(onDone, duration);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const icon = type === 'success'
    ? <IconCheck size={14} strokeWidth={2.5} />
    : type === 'error'
      ? <IconX size={14} strokeWidth={2.5} />
      : <IconInfoCircle size={14} strokeWidth={2.5} />;

  const accentColor = type === 'error' ? '#C0392B' : 'var(--accent-color, #C0392B)';
  const bgColor     = type === 'error' ? 'rgba(192,57,43,0.15)' : 'rgba(var(--accent-color-rgb, 192,57,43),0.12)';

  const isEnter = phase === 'enter';
  const isExit  = phase === 'exit';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: isEnter
          ? 'translateX(-50%) translateY(-20px) scale(0.6)'
          : isExit
            ? 'translateX(-50%) translateY(-16px) scale(0.85)'
            : 'translateX(-50%) translateY(0px) scale(1)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: isEnter ? 0 : 8,
        backgroundColor: '#111111',
        border: `1px solid ${accentColor}`,
        borderRadius: 99,
        padding: isEnter ? '8px' : '9px 16px 9px 12px',
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}22`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity: isEnter ? 0 : isExit ? 0 : 1,
        maxWidth: isEnter ? 36 : 420,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: isEnter
          ? 'all 0.35s cubic-bezier(0.34, 1.4, 0.64, 1)'
          : isExit
            ? 'all 0.3s cubic-bezier(0.4, 0, 1, 1)'
            : 'all 0.35s cubic-bezier(0.34, 1.4, 0.64, 1)',
        willChange: 'transform, opacity, max-width, padding',
      }}
    >
      {/* Icon bubble */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          flexShrink: 0,
          transition: 'all 0.3s ease',
        }}
      >
        {icon}
      </div>

      {/* Message — fades in slightly after expand */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#ffffff',
          opacity: isEnter ? 0 : isExit ? 0 : 1,
          transition: 'opacity 0.2s ease 0.1s',
          letterSpacing: '-0.01em',
        }}
      >
        {message}
      </span>
    </div>,
    document.body
  );
}
