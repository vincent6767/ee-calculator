import { beforeEach, describe, expect, it } from 'vitest';
import { blankForm } from '../model/form';
import {
  STORAGE_KEY,
  loadScenarios,
  persist,
  removeScenario,
  renameScenario,
  saveScenario,
} from './scenarios';

const result = { total: 424, core: 349, spousePts: 0, transfer: 75, additional: 0 };

beforeEach(() => {
  localStorage.clear();
});

describe('loadScenarios()', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(loadScenarios()).toEqual([]);
  });

  it('tolerates corrupt JSON without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(() => loadScenarios()).not.toThrow();
    expect(loadScenarios()).toEqual([]);
  });

  it('tolerates a stored value that is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ oops: true }));
    expect(loadScenarios()).toEqual([]);
  });

  it('round-trips a persisted list, including inputs and result', () => {
    const form = { ...blankForm(), hasSpouse: false, age: '30' };
    const scenario = { id: 's1', name: 'Test', createdAt: 1, updatedAt: 1, inputs: form, result };
    persist([scenario]);
    const loaded = loadScenarios();
    expect(loaded).toEqual([scenario]);
  });
});

describe('saveScenario()', () => {
  it('creates a new scenario with an id and matching created/updated timestamps', () => {
    const form = blankForm();
    const outcome = saveScenario({ list: [], id: null, name: 'My scenario', form, result });
    expect(outcome.updated).toBe(false);
    expect(outcome.list).toHaveLength(1);
    expect(outcome.list[0].id).toBeTruthy();
    expect(outcome.list[0].createdAt).toBe(outcome.list[0].updatedAt);
    expect(outcome.list[0].name).toBe('My scenario');
  });

  it('defaults the name to "Scenario N" when left blank', () => {
    const form = blankForm();
    const outcome = saveScenario({ list: [], id: null, name: '  ', form, result });
    expect(outcome.name).toBe('Scenario 1');
  });

  it('updates an existing scenario in place when an id is passed (not "save as new")', () => {
    const form = blankForm();
    const first = saveScenario({ list: [], id: null, name: 'Original', form, result });
    const changedForm = { ...form, age: '35' };
    const second = saveScenario({ list: first.list, id: first.id, name: 'Renamed', form: changedForm, result });

    expect(second.updated).toBe(true);
    expect(second.list).toHaveLength(1);
    expect(second.list[0].id).toBe(first.id);
    expect(second.list[0].name).toBe('Renamed');
    expect(second.list[0].inputs.age).toBe('35');
  });

  it('"save as new" (id: null) appends a second scenario instead of overwriting', () => {
    const form = blankForm();
    const first = saveScenario({ list: [], id: null, name: 'First', form, result });
    const second = saveScenario({ list: first.list, id: null, name: 'Second', form, result });

    expect(second.list).toHaveLength(2);
    expect(second.list[0].id).not.toBe(second.list[1].id);
  });

  it('deep-copies inputs so later form mutations do not alias the saved scenario', () => {
    const form = blankForm();
    const outcome = saveScenario({ list: [], id: null, name: 'X', form, result });
    form.age = '99';
    expect(outcome.list[0].inputs.age).toBe('');
  });
});

describe('removeScenario()', () => {
  it('removes only the targeted scenario', () => {
    const form = blankForm();
    const a = saveScenario({ list: [], id: null, name: 'A', form, result });
    const b = saveScenario({ list: a.list, id: null, name: 'B', form, result });
    const after = removeScenario(b.list, a.id);
    expect(after).toHaveLength(1);
    expect(after[0].id).toBe(b.id);
  });
});

describe('renameScenario()', () => {
  it('renames the matching scenario and bumps updatedAt', () => {
    const form = blankForm();
    const a = saveScenario({ list: [], id: null, name: 'A', form, result });
    const renamed = renameScenario(a.list, a.id, 'B');
    expect(renamed[0].name).toBe('B');
  });

  it('ignores a blank name', () => {
    const form = blankForm();
    const a = saveScenario({ list: [], id: null, name: 'A', form, result });
    const renamed = renameScenario(a.list, a.id, '   ');
    expect(renamed[0].name).toBe('A');
  });
});
