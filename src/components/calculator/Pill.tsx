import type { CSSProperties } from 'react';
import { pillStyle } from '../styles';

export interface PillOption<T> {
  v: T;
  label: string;
  disabled?: boolean;
}

export function PillGroup<T extends string | number | boolean>({
  options,
  value,
  onSelect,
  style,
}: {
  options: PillOption<T>[];
  value: T | null | undefined;
  onSelect: (v: T) => void;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', ...style }}>
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          className="pill-option"
          disabled={o.disabled}
          onClick={() => !o.disabled && onSelect(o.v)}
          style={pillStyle(value === o.v, o.disabled)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const YES_NO: PillOption<boolean>[] = [
  { v: true, label: 'Yes' },
  { v: false, label: 'No' },
];
