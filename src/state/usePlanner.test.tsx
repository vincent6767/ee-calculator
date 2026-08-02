import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePlanner } from './usePlanner';

const completeProfile = {
  hasSpouse: false as const,
  age: '30',
  education: 'bachelors' as const,
  eduCanada: false as const,
  cdnWork: 0,
  foreignWork: 3,
  trade: false as const,
  l1Test: 'ielts' as const,
  l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' },
  l2Test: 'none' as const,
  pn: false as const,
  sibling: false as const,
};

beforeEach(() => {
  localStorage.clear();
});

describe('usePlanner', () => {
  it('blocks calculate while missing() is non-empty and toasts the first gap', () => {
    const { result } = renderHook(() => usePlanner());
    act(() => result.current.calculate());
    expect(result.current.result).toBeNull();
    expect(result.current.toast).toContain('Spouse or partner');
  });

  it('calculate() succeeds once every section is filled in', () => {
    const { result } = renderHook(() => usePlanner());
    act(() => result.current.sf(completeProfile));
    act(() => result.current.calculate());
    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.total).toBe(424);
    expect(result.current.result!.stale).toBe(false);
  });

  it('editing the form after a result marks it stale (liveScoring off)', () => {
    const { result } = renderHook(() => usePlanner());
    act(() => result.current.sf(completeProfile));
    act(() => result.current.calculate());
    expect(result.current.result!.stale).toBe(false);

    act(() => result.current.sf({ age: '31' }));
    expect(result.current.result!.stale).toBe(true);
  });

  it('liveScoring recomputes automatically once the form becomes complete', () => {
    const { result } = renderHook(() => usePlanner({ liveScoring: true }));
    // fill everything except the last field
    const { sibling: _sibling, ...partial } = completeProfile;
    act(() => result.current.sf(partial));
    expect(result.current.result).toBeNull();

    act(() => result.current.sf({ sibling: false }));
    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.stale).toBe(false);
    expect(result.current.result!.total).toBe(424);
  });

  it('save() persists a scenario and load() restores it into the form', () => {
    const { result } = renderHook(() => usePlanner());
    act(() => result.current.sf(completeProfile));
    act(() => result.current.calculate());
    act(() => result.current.setSaveName('Baseline'));
    act(() => result.current.save(false));

    expect(result.current.scenarios).toHaveLength(1);
    expect(result.current.scenarios[0].name).toBe('Baseline');
    expect(localStorage.getItem('crsPlannerScenarios')).toContain('Baseline');

    act(() => result.current.newScenario());
    expect(result.current.result).toBeNull();

    act(() => result.current.load(result.current.scenarios[0]));
    expect(result.current.form.age).toBe('30');
    expect(result.current.view).toBe('calc');
    expect(result.current.result!.total).toBe(424);
  });

  it('del() requires two calls: first arms confirmDelete, second deletes', () => {
    const { result } = renderHook(() => usePlanner());
    act(() => result.current.sf(completeProfile));
    act(() => result.current.calculate());
    act(() => result.current.save(false));
    const id = result.current.scenarios[0].id;

    act(() => result.current.del(id));
    expect(result.current.confirmDelete).toBe(id);
    expect(result.current.scenarios).toHaveLength(1);

    act(() => result.current.del(id));
    expect(result.current.scenarios).toHaveLength(0);
    expect(result.current.toast).toBe('Scenario deleted');
  });

  it('toggleSel() adds/removes ids from compareSel, and baseline can be set explicitly', () => {
    const { result } = renderHook(() => usePlanner());
    act(() => result.current.toggleSel('a'));
    act(() => result.current.toggleSel('b'));
    expect(result.current.compareSel).toEqual(['a', 'b']);

    act(() => result.current.toggleSel('a'));
    expect(result.current.compareSel).toEqual(['b']);

    act(() => result.current.setBaseline('b'));
    expect(result.current.baseline).toBe('b');
  });
});
