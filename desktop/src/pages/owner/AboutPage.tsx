import { IconInfoCircle, IconCode, IconUser, IconMail, IconPhone, IconBrandFacebook, IconScale, IconBuildingCommunity, IconDeviceDesktop } from '@tabler/icons-react';
import { useBrandName } from '../../hooks/useBrandName';

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-5"
      style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
    >
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span style={{ fontSize: 12, color: '#606060', minWidth: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#ffffff', textAlign: 'right', fontFamily: mono ? 'var(--font-mono, monospace)' : undefined }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { stallName } = useBrandName();

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Header */}
      <div className="flex items-center gap-2">
        <IconInfoCircle size={18} color="#C0392B" />
        <h1 className="text-white font-semibold text-lg">About</h1>
      </div>

      {/* Grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>

        {/* App info */}
        <Section title="Application" icon={<IconDeviceDesktop size={15} color="#C0392B" />}>
          <InfoRow label="App Name"    value={stallName} />
          <InfoRow label="Version"     value="1.0.0" mono />
          <InfoRow label="Platform"    value="Desktop (Tauri + React)" />
          <div className="flex flex-col gap-1 pt-1">
            <span style={{ fontSize: 12, color: '#606060' }}>Description</span>
            <p style={{ fontSize: 13, color: '#A0A0A0', lineHeight: 1.7 }}>
              {stallName} is a lightweight, offline-capable point-of-sale desktop application
              built for small food stalls and restaurants. It covers the full order lifecycle —
              from cashier order entry and kitchen queue management to owner-facing analytics,
              expense tracking, shift reports, and system configuration — all running locally
              without requiring an internet connection.
            </p>
          </div>
        </Section>

        {/* Tech stack */}
        <Section title="Tech Stack" icon={<IconCode size={15} color="#C0392B" />}>
          {[
            { label: 'Framework',  value: 'React 19 + TypeScript'     },
            { label: 'Desktop',    value: 'Tauri 2'                   },
            { label: 'Styling',    value: 'Tailwind CSS'              },
            { label: 'Charts',     value: 'Recharts'                  },
            { label: 'Backend',    value: 'Node.js + Express'         },
            { label: 'Database',   value: 'SQLite (better-sqlite3)'   },
            { label: 'Realtime',   value: 'Socket.IO'                 },
            { label: 'State',      value: 'Zustand'                   },
            { label: 'Icons',      value: 'Tabler Icons'              },
          ].map(({ label, value }) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </Section>

        {/* Developer info */}
        <Section title="Developer" icon={<IconUser size={15} color="#C0392B" />}>
          <InfoRow label="Name"   value="Alberto Jr. Auxtero Daro" />
          <InfoRow label="School" value="Trinidad Municipal College" />
          <div className="flex items-center gap-1.5 pt-1">
            <IconBuildingCommunity size={13} color="#606060" />
            <span style={{ fontSize: 12, color: '#606060' }}>For Sale Project</span>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact" icon={<IconMail size={15} color="#C0392B" />}>
          <div className="flex items-center gap-3">
            <IconMail size={14} color="#606060" />
            <span style={{ fontSize: 13, color: '#ffffff' }}>albertoiidaro0@gmail.com</span>
          </div>
          <div className="flex items-center gap-3">
            <IconPhone size={14} color="#606060" />
            <span style={{ fontSize: 13, color: '#ffffff' }}>+63 993 693 0782</span>
          </div>
          <div className="flex items-center gap-3">
            <IconBrandFacebook size={14} color="#606060" />
            <span style={{ fontSize: 13, color: '#ffffff' }}>Jay-ar Daro</span>
          </div>
        </Section>

        {/* License — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Section title="License" icon={<IconScale size={15} color="#C0392B" />}>
            <div className="flex flex-col gap-3">
              <InfoRow label="License Type" value="MIT License" />
              <InfoRow label="Copyright"    value={`© ${new Date().getFullYear()} Alberto Jr. Auxtero Daro`} />
              <p style={{ fontSize: 12, color: '#606060', lineHeight: 1.7 }}>
                Permission is hereby granted, free of charge, to any person obtaining a copy of this
                software and associated documentation files, to deal in the software without restriction —
                including without limitation the rights to use, copy, modify, merge, publish, distribute,
                sublicense, and/or sell copies of the software — subject to the condition that the above
                copyright notice and this permission notice shall be included in all copies or substantial
                portions of the software.
              </p>
              <p style={{ fontSize: 12, color: '#404040', lineHeight: 1.7 }}>
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
                IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES,
                OR OTHER LIABILITY ARISING FROM THE USE OF THIS SOFTWARE.
              </p>
            </div>
          </Section>
        </div>

      </div>

    </div>
  );
}
