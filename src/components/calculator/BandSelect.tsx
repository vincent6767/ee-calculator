import { bandsFor } from '../../scoring/bands';
import type { Skill, TestKey } from '../../model/form';
import { SKILLS } from '../../model/form';
import { smallSelectStyle } from '../styles';

export function BandSelectGrid({
  test,
  group,
  onChange,
}: {
  test: TestKey;
  group: Record<Skill, string>;
  onChange: (skill: Skill, value: string) => void;
}) {
  const bands = bandsFor(test);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
      {SKILLS.map(([k, label]) => (
        <label key={k} style={{ display: 'block' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6E6250', marginBottom: 6 }}>{label}</div>
          <select
            value={group[k]}
            onChange={(e) => onChange(k, e.target.value)}
            style={smallSelectStyle}
          >
            <option value="">Band…</option>
            {bands[k].map(([opt]) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
