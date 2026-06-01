import { IconHistory, IconSparkles, IconBug, IconTool, IconTag } from '@tabler/icons-react';
import CHANGELOG_DATA from '../../data/changelog.json';

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryType = 'feature' | 'fix' | 'improvement' | 'breaking';

interface ChangeEntry {
  type: EntryType;
  text: string;
}

interface VersionEntry {
  version: string;
  date: string;
  label?: string;
  changes: ChangeEntry[];
}

const CHANGELOG = CHANGELOG_DATA as VersionEntry[];

// ─── Entry type config ────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<EntryType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  feature:     { label: 'New',      color: '#27AE60', bg: 'rgba(39,174,96,0.1)',  border: 'rgba(39,174,96,0.25)',  icon: <IconSparkles size={11} /> },
  fix:         { label: 'Fix',      color: '#C0392B', bg: 'rgba(192,57,43,0.1)',  border: 'rgba(192,57,43,0.25)',  icon: <IconBug size={11} />      },
  improvement: { label: 'Improved', color: '#3498DB', bg: 'rgba(52,152,219,0.1)', border: 'rgba(52,152,219,0.25)', icon: <IconTool size={11} />     },
  breaking:    { label: 'Breaking', color: '#F39C12', bg: 'rgba(243,156,18,0.1)', border: 'rgba(243,156,18,0.25)', icon: <IconTag size={11} />      },
};

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: EntryType }) {
  const c = TYPE_CONFIG[type];
  return (
    <span
      className="inline-flex items-center gap-1 shrink-0"
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 4,
        padding: '1px 6px',
        fontSize: 10,
        fontWeight: 700,
        color: c.color,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

// ─── Version block ────────────────────────────────────────────────────────────

function VersionBlock({ entry }: { entry: VersionEntry }) {
  const features     = entry.changes.filter(c => c.type === 'feature');
  const fixes        = entry.changes.filter(c => c.type === 'fix');
  const improvements = entry.changes.filter(c => c.type === 'improvement');
  const breaking     = entry.changes.filter(c => c.type === 'breaking');

  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-5"
      style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
    >
      {/* Version header */}
      <div
        className="flex items-center justify-between flex-wrap gap-2 pb-3"
        style={{ borderBottom: '1px solid #2C2C2C' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)' }}>
            v{entry.version}
          </span>
          {entry.label && (
            <span style={{
              backgroundColor: 'rgba(192,57,43,0.12)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 6,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: '#C0392B',
            }}>
              {entry.label}
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#606060' }}>{entry.date}</span>
      </div>

      {/* Change groups — rendered in priority order */}
      {[
        { list: breaking,     title: 'Breaking Changes' },
        { list: features,     title: 'New Features'     },
        { list: improvements, title: 'Improvements'     },
        { list: fixes,        title: 'Bug Fixes'        },
      ].filter(g => g.list.length > 0).map(group => (
        <div key={group.title} className="flex flex-col gap-2">
          <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            {group.title}
          </p>
          <div className="flex flex-col gap-2">
            {group.list.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <TypeBadge type={item.type} />
                <span style={{ fontSize: 13, color: '#A0A0A0', lineHeight: 1.6 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChangelogPage() {
  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconHistory size={18} color="#C0392B" />
          <h1 className="text-white font-semibold text-lg">Changelog</h1>
        </div>
        <span style={{
          fontSize: 11, color: '#606060',
          backgroundColor: '#111111',
          border: '1px solid #2C2C2C',
          borderRadius: 6,
          padding: '3px 10px',
        }}>
          {CHANGELOG.length} {CHANGELOG.length === 1 ? 'release' : 'releases'}
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {(Object.entries(TYPE_CONFIG) as [EntryType, typeof TYPE_CONFIG[EntryType]][]).map(([type, c]) => (
          <span
            key={type}
            className="inline-flex items-center gap-1"
            style={{
              backgroundColor: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: 10,
              fontWeight: 700,
              color: c.color,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {c.icon}{c.label}
          </span>
        ))}
      </div>

      {/* Version list — newest first */}
      <div className="flex flex-col gap-4">
        {CHANGELOG.map(entry => (
          <VersionBlock key={entry.version} entry={entry} />
        ))}
      </div>

    </div>
  );
}
