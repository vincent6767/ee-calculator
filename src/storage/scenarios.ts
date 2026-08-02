// Ported verbatim (persist/save/delete/rename semantics) from `class Component`
// (dc.html lines 637, 691-722, 929-935). Storage key preserved exactly.
import type { Form, ScoreResult, Scenario } from '../model/form';

export const STORAGE_KEY = 'crsPlannerScenarios';

export function loadScenarios(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function persist(list: Scenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable/full — silently no-op, matching the prototype
  }
}

export interface SaveScenarioArgs {
  list: Scenario[];
  id: string | null;
  name: string;
  form: Form;
  result: ScoreResult;
}

export interface SaveScenarioOutcome {
  list: Scenario[];
  id: string;
  name: string;
  updated: boolean;
}

export function saveScenario({ list, id, name, form, result }: SaveScenarioArgs): SaveScenarioOutcome {
  const now = Date.now();
  const finalName = (name || '').trim() || 'Scenario ' + (list.length + 1);
  const existing = id ? list.find((s) => s.id === id) : undefined;
  const next = [...list];

  if (existing) {
    const i = next.indexOf(existing);
    next[i] = { ...existing, name: finalName, updatedAt: now, inputs: JSON.parse(JSON.stringify(form)), result };
    return { list: next, id: existing.id, name: finalName, updated: true };
  }

  const newId = 's' + now + Math.random().toString(36).slice(2, 6);
  next.push({ id: newId, name: finalName, createdAt: now, updatedAt: now, inputs: JSON.parse(JSON.stringify(form)), result });
  return { list: next, id: newId, name: finalName, updated: false };
}

export function removeScenario(list: Scenario[], id: string): Scenario[] {
  return list.filter((s) => s.id !== id);
}

export function renameScenario(list: Scenario[], id: string, name: string): Scenario[] {
  const trimmed = (name || '').trim();
  if (!trimmed) return list;
  return list.map((s) => (s.id === id ? { ...s, name: trimmed, updatedAt: Date.now() } : s));
}

export function clearAllScenarios(): Scenario[] {
  return [];
}
