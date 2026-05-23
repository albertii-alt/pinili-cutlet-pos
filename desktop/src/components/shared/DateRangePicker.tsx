import { useState } from 'react';
import { IconCalendar, IconArrowRight, IconAlertCircle } from '@tabler/icons-react';

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  onApply: (range: DateRangeValue) => void;
}

export default function DateRangePicker({ value, onChange, onApply }: DateRangePickerProps) {
  const [error, setError] = useState<string | null>(null);

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function handleStartChange(startDate: string) {
    setError(null);
    onChange({ ...value, startDate });
  }

  function handleEndChange(endDate: string) {
    setError(null);
    onChange({ ...value, endDate });
  }

  function handleApply() {
    const { startDate, endDate } = value;

    if (!startDate || !endDate) {
      setError('Please select both a start and end date.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }
    if (startDate > today || endDate > today) {
      setError('Dates cannot be in the future.');
      return;
    }

    setError(null);
    onApply({ startDate, endDate });
  }

  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      style={{ padding: '8px 12px', backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 10 }}
    >
      {/* Icon */}
      <IconCalendar size={15} color="#606060" />

      {/* From date */}
      <div className="flex flex-col gap-0.5">
        <label style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          From
        </label>
        <input
          type="date"
          value={value.startDate}
          max={today}
          onChange={e => handleStartChange(e.target.value)}
          style={{
            backgroundColor: '#242424',
            border: '1px solid #2C2C2C',
            borderRadius: 6,
            padding: '4px 8px',
            color: value.startDate ? '#ffffff' : '#606060',
            fontSize: 13,
            outline: 'none',
            colorScheme: 'dark',
            cursor: 'pointer',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
        />
      </div>

      {/* Arrow separator */}
      <IconArrowRight size={13} color="#606060" style={{ marginTop: 14 }} />

      {/* To date */}
      <div className="flex flex-col gap-0.5">
        <label style={{ fontSize: 10, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          To
        </label>
        <input
          type="date"
          value={value.endDate}
          min={value.startDate || undefined}
          max={today}
          onChange={e => handleEndChange(e.target.value)}
          style={{
            backgroundColor: '#242424',
            border: '1px solid #2C2C2C',
            borderRadius: 6,
            padding: '4px 8px',
            color: value.endDate ? '#ffffff' : '#606060',
            fontSize: 13,
            outline: 'none',
            colorScheme: 'dark',
            cursor: 'pointer',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
        />
      </div>

      {/* Apply button */}
      <button
        onClick={handleApply}
        disabled={!value.startDate || !value.endDate}
        style={{
          marginTop: 14,
          backgroundColor: !value.startDate || !value.endDate ? '#242424' : '#C0392B',
          border: 'none',
          borderRadius: 6,
          padding: '5px 14px',
          color: !value.startDate || !value.endDate ? '#606060' : '#ffffff',
          fontSize: 13,
          fontWeight: 500,
          cursor: !value.startDate || !value.endDate ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          if (value.startDate && value.endDate) e.currentTarget.style.backgroundColor = '#96281B';
        }}
        onMouseLeave={e => {
          if (value.startDate && value.endDate) e.currentTarget.style.backgroundColor = '#C0392B';
        }}
      >
        Apply
      </button>

      {/* Validation error */}
      {error && (
        <div className="flex items-center gap-1 w-full" style={{ marginTop: 2 }}>
          <IconAlertCircle size={12} color="#C0392B" />
          <span style={{ fontSize: 11, color: '#C0392B' }}>{error}</span>
        </div>
      )}
    </div>
  );
}
