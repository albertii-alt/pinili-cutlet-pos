import { useState } from 'react';
import {
  IconHeadset,
  IconMail,
  IconBug,
  IconBulb,
  IconCheck,
  IconChevronDown,
  IconBrandFacebook,
  IconPhone,
} from '@tabler/icons-react';

const DEVELOPER_EMAIL = 'albertoiidaro0@gmail.com';

type FormType = 'contact' | 'bug' | 'feature';

// ─── Shared components ────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-5"
      style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #2C2C2C' }}>
      <span style={{ color: '#C0392B' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {children}
      </span>
    </div>
  );
}

const inputBase: React.CSSProperties = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2C2C2C',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#ffffff',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: 12, color: '#606060' }}>
        {label}
        {required && <span style={{ color: '#C0392B', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Success toast ────────────────────────────────────────────────────────────

function SuccessToast({ message, onDone }: { message: string; onDone: () => void }) {
  useState(() => { setTimeout(onDone, 3500); });
  return (
    <div
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl z-50"
      style={{
        backgroundColor: '#111111',
        border: '1px solid rgba(39,174,96,0.4)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(39,174,96,0.2)' }}>
        <IconCheck size={12} color="#27AE60" />
      </div>
      <span style={{ fontSize: 13, color: '#27AE60' }}>{message}</span>
    </div>
  );
}

// ─── Contact Developer Form ───────────────────────────────────────────────────

function ContactForm() {
  const [name, setName]       = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast]     = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = 'Name is required.';
    if (!subject.trim()) e.subject = 'Subject is required.';
    if (!message.trim()) e.message = 'Message is required.';
    return e;
  }

  async function handleSend() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const body = encodeURIComponent(
      `Hi Alberto,\n\nMy name is ${name.trim()}.\n\n${message.trim()}\n\n---\nSent from Pinili Cutlet Desktop App`
    );
    const sub  = encodeURIComponent(`[Pinili Cutlet] ${subject.trim()}`);
    const url  = `mailto:${DEVELOPER_EMAIL}?subject=${sub}&body=${body}`;

    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      await openUrl(url);
    } catch {
      // Fallback for non-Tauri environments
      window.location.href = url;
    }

    setName(''); setSubject(''); setMessage('');
    setErrors({});
    setToast(true);
  }

  return (
    <Card>
      <SectionTitle icon={<IconMail size={15} />}>Contact Developer</SectionTitle>

      <Field label="Your Name" required>
        <input
          value={name}
          onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
          placeholder="e.g. Juan dela Cruz"
          style={{ ...inputBase, borderColor: errors.name ? '#C0392B' : '#2C2C2C' }}
          onFocus={e => (e.currentTarget.style.borderColor = errors.name ? '#C0392B' : '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = errors.name ? '#C0392B' : '#2C2C2C')}
        />
        {errors.name && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.name}</span>}
      </Field>

      <Field label="Subject" required>
        <input
          value={subject}
          onChange={e => { setSubject(e.target.value); setErrors(p => ({ ...p, subject: '' })); }}
          placeholder="e.g. Question about the app"
          style={{ ...inputBase, borderColor: errors.subject ? '#C0392B' : '#2C2C2C' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = errors.subject ? '#C0392B' : '#2C2C2C')}
        />
        {errors.subject && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.subject}</span>}
      </Field>

      <Field label="Message" required>
        <textarea
          value={message}
          onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: '' })); }}
          placeholder="Write your message here..."
          rows={5}
          style={{
            ...inputBase,
            resize: 'vertical',
            minHeight: 100,
            borderColor: errors.message ? '#C0392B' : '#2C2C2C',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = errors.message ? '#C0392B' : '#2C2C2C')}
        />
        {errors.message && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.message}</span>}
      </Field>

      <div className="flex items-center justify-between">
        <p style={{ fontSize: 11, color: '#606060' }}>
          Opens your default email client with the message pre-filled.
        </p>
        <button
          onClick={handleSend}
          className="flex items-center gap-2"
          style={{
            backgroundColor: '#C0392B',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#96281B')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C0392B')}
        >
          <IconMail size={14} />
          Send Message
        </button>
      </div>

      {/* Direct contact info */}
      <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid #2C2C2C' }}>
        <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Or reach out directly
        </p>
        <div className="flex items-center gap-2">
          <IconMail size={13} color="#606060" />
          <span style={{ fontSize: 12, color: '#A0A0A0' }}>{DEVELOPER_EMAIL}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconPhone size={13} color="#606060" />
          <span style={{ fontSize: 12, color: '#A0A0A0' }}>+63 993 693 0782</span>
        </div>
        <div className="flex items-center gap-2">
          <IconBrandFacebook size={13} color="#606060" />
          <span style={{ fontSize: 12, color: '#A0A0A0' }}>Jay-ar Daro</span>
        </div>
      </div>

      {toast && <SuccessToast message="Email client opened — message ready to send" onDone={() => setToast(false)} />}
    </Card>
  );
}

// ─── Bug Report Form ──────────────────────────────────────────────────────────

const BUG_SEVERITY = ['Low — Minor visual issue', 'Medium — Feature not working correctly', 'High — App crashes or data loss'];

function BugReportForm() {
  const [title, setTitle]         = useState('');
  const [severity, setSeverity]   = useState(BUG_SEVERITY[1]);
  const [steps, setSteps]         = useState('');
  const [expected, setExpected]   = useState('');
  const [actual, setActual]       = useState('');
  const [toast, setToast]         = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Bug title is required.';
    if (!steps.trim()) e.steps = 'Steps to reproduce are required.';
    if (!actual.trim()) e.actual = 'Actual behavior is required.';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const body = encodeURIComponent(
      `BUG REPORT\n${'─'.repeat(40)}\n\nTitle: ${title.trim()}\nSeverity: ${severity}\n\nSteps to Reproduce:\n${steps.trim()}\n\nExpected Behavior:\n${expected.trim() || 'N/A'}\n\nActual Behavior:\n${actual.trim()}\n\n---\nSent from Pinili Cutlet Desktop App`
    );
    const sub = encodeURIComponent(`[Bug Report] ${title.trim()}`);
    const url = `mailto:${DEVELOPER_EMAIL}?subject=${sub}&body=${body}`;

    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      await openUrl(url);
    } catch {
      window.location.href = url;
    }

    setTitle(''); setSeverity(BUG_SEVERITY[1]); setSteps(''); setExpected(''); setActual('');
    setErrors({});
    setToast(true);
  }

  return (
    <Card>
      <SectionTitle icon={<IconBug size={15} />}>Report a Bug</SectionTitle>

      <Field label="Bug Title" required>
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
          placeholder="e.g. Order total shows wrong amount"
          style={{ ...inputBase, borderColor: errors.title ? '#C0392B' : '#2C2C2C' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = errors.title ? '#C0392B' : '#2C2C2C')}
        />
        {errors.title && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.title}</span>}
      </Field>

      <Field label="Severity">
        <div className="relative">
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value)}
            style={{
              ...inputBase,
              appearance: 'none',
              WebkitAppearance: 'none',
              paddingRight: 32,
              cursor: 'pointer',
              colorScheme: 'dark',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
          >
            {BUG_SEVERITY.map(s => (
              <option key={s} value={s} style={{ backgroundColor: '#1A1A1A' }}>{s}</option>
            ))}
          </select>
          <IconChevronDown size={13} color="#606060"
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </Field>

      <Field label="Steps to Reproduce" required>
        <textarea
          value={steps}
          onChange={e => { setSteps(e.target.value); setErrors(p => ({ ...p, steps: '' })); }}
          placeholder="1. Go to...\n2. Click on...\n3. See error"
          rows={4}
          style={{
            ...inputBase, resize: 'vertical', minHeight: 90,
            borderColor: errors.steps ? '#C0392B' : '#2C2C2C',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = errors.steps ? '#C0392B' : '#2C2C2C')}
        />
        {errors.steps && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.steps}</span>}
      </Field>

      <Field label="Expected Behavior">
        <textarea
          value={expected}
          onChange={e => setExpected(e.target.value)}
          placeholder="What should have happened?"
          rows={2}
          style={{ ...inputBase, resize: 'vertical', minHeight: 60 }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
        />
      </Field>

      <Field label="Actual Behavior" required>
        <textarea
          value={actual}
          onChange={e => { setActual(e.target.value); setErrors(p => ({ ...p, actual: '' })); }}
          placeholder="What actually happened?"
          rows={2}
          style={{
            ...inputBase, resize: 'vertical', minHeight: 60,
            borderColor: errors.actual ? '#C0392B' : '#2C2C2C',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = errors.actual ? '#C0392B' : '#2C2C2C')}
        />
        {errors.actual && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.actual}</span>}
      </Field>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2"
          style={{
            backgroundColor: '#C0392B',
            border: 'none', borderRadius: 8,
            padding: '8px 18px',
            color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#96281B')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C0392B')}
        >
          <IconBug size={14} />
          Submit Bug Report
        </button>
      </div>

      {toast && <SuccessToast message="Bug report ready — email client opened" onDone={() => setToast(false)} />}
    </Card>
  );
}

// ─── Feature Request Form ─────────────────────────────────────────────────────

const FEATURE_CATEGORIES = [
  'Dashboard & Analytics',
  'Menu Management',
  'Order & Cashier',
  'Reports & History',
  'Settings & Configuration',
  'Performance & Stability',
  'Other',
];

function FeatureRequestForm() {
  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState(FEATURE_CATEGORIES[0]);
  const [problem, setProblem]   = useState('');
  const [solution, setSolution] = useState('');
  const [toast, setToast]       = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim())    e.title    = 'Feature title is required.';
    if (!solution.trim()) e.solution = 'Please describe the feature.';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const body = encodeURIComponent(
      `FEATURE REQUEST\n${'─'.repeat(40)}\n\nTitle: ${title.trim()}\nCategory: ${category}\n\nProblem / Pain Point:\n${problem.trim() || 'N/A'}\n\nProposed Solution:\n${solution.trim()}\n\n---\nSent from Pinili Cutlet Desktop App`
    );
    const sub = encodeURIComponent(`[Feature Request] ${title.trim()}`);
    const url = `mailto:${DEVELOPER_EMAIL}?subject=${sub}&body=${body}`;

    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      await openUrl(url);
    } catch {
      window.location.href = url;
    }

    setTitle(''); setCategory(FEATURE_CATEGORIES[0]); setProblem(''); setSolution('');
    setErrors({});
    setToast(true);
  }

  return (
    <Card>
      <SectionTitle icon={<IconBulb size={15} />}>Feature Request</SectionTitle>

      <Field label="Feature Title" required>
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
          placeholder="e.g. Export analytics as PDF"
          style={{ ...inputBase, borderColor: errors.title ? '#C0392B' : '#2C2C2C' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = errors.title ? '#C0392B' : '#2C2C2C')}
        />
        {errors.title && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.title}</span>}
      </Field>

      <Field label="Category">
        <div className="relative">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              ...inputBase,
              appearance: 'none',
              WebkitAppearance: 'none',
              paddingRight: 32,
              cursor: 'pointer',
              colorScheme: 'dark',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
          >
            {FEATURE_CATEGORIES.map(c => (
              <option key={c} value={c} style={{ backgroundColor: '#1A1A1A' }}>{c}</option>
            ))}
          </select>
          <IconChevronDown size={13} color="#606060"
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </Field>

      <Field label="Problem / Pain Point">
        <textarea
          value={problem}
          onChange={e => setProblem(e.target.value)}
          placeholder="What problem does this feature solve? What's currently frustrating?"
          rows={3}
          style={{ ...inputBase, resize: 'vertical', minHeight: 70 }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
        />
      </Field>

      <Field label="Proposed Solution" required>
        <textarea
          value={solution}
          onChange={e => { setSolution(e.target.value); setErrors(p => ({ ...p, solution: '' })); }}
          placeholder="Describe the feature you'd like to see. How should it work?"
          rows={4}
          style={{
            ...inputBase, resize: 'vertical', minHeight: 90,
            borderColor: errors.solution ? '#C0392B' : '#2C2C2C',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = errors.solution ? '#C0392B' : '#2C2C2C')}
        />
        {errors.solution && <span style={{ fontSize: 11, color: '#C0392B' }}>{errors.solution}</span>}
      </Field>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2"
          style={{
            backgroundColor: '#C0392B',
            border: 'none', borderRadius: 8,
            padding: '8px 18px',
            color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#96281B')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C0392B')}
        >
          <IconBulb size={14} />
          Submit Request
        </button>
      </div>

      {toast && <SuccessToast message="Feature request ready — email client opened" onDone={() => setToast(false)} />}
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type TabId = 'contact' | 'bug' | 'feature';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'contact', label: 'Contact Developer', icon: <IconMail size={15} />  },
  { id: 'bug',     label: 'Report a Bug',      icon: <IconBug size={15} />   },
  { id: 'feature', label: 'Feature Request',   icon: <IconBulb size={15} />  },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<TabId>('contact');

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Header */}
      <div className="flex items-center gap-2">
        <IconHeadset size={18} color="#C0392B" />
        <h1 className="text-white font-semibold text-lg">Support & Feedback</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--accent-color, #C0392B)' : '#111111',
              border: `1px solid ${activeTab === tab.id ? 'transparent' : '#2C2C2C'}`,
              color: activeTab === tab.id ? '#ffffff' : '#606060',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#ffffff'; } }}
            onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#606060'; } }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-2xl w-full">
        {activeTab === 'contact' && <ContactForm />}
        {activeTab === 'bug'     && <BugReportForm />}
        {activeTab === 'feature' && <FeatureRequestForm />}
      </div>

    </div>
  );
}
