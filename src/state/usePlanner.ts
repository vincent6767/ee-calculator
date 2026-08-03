import { useEffect, useRef, useState } from 'react';
import { blankForm } from '../model/form';
import type { Form, Scenario } from '../model/form';
import { samples } from '../model/samples';
import { missing, sectionsDone } from '../model/validation';
import { affects, compute, type ScoreResult } from '../scoring/scoring';
import {
  clearAllScenarios,
  loadScenarios,
  persist,
  removeScenario,
  renameScenario,
  saveScenario,
} from '../storage/scenarios';
import { track } from '../lib/analytics';

export type View = 'calc' | 'saved' | 'compare';

export interface StaleResult extends ScoreResult {
  stale: boolean;
}

export interface PlannerProps {
  donateUrl?: string;
  liveScoring?: boolean;
  sampleData?: boolean;
}

const TOAST_MS = 2600;

export function usePlanner(props: PlannerProps = {}) {
  const [view, setView] = useState<View>('calc');
  const [form, setForm] = useState<Form>(blankForm());
  const [result, setResult] = useState<StaleResult | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [compareSel, setCompareSel] = useState<string[]>([]);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editName, setEditName] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState('');
  const [clearOpen, setClearOpen] = useState(false);
  const [clearText, setClearText] = useState('');
  const [toast, setToast] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [calculatedOnce, setCalculatedOnce] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const sampleCache = useRef<Scenario[] | null>(null);

  useEffect(() => {
    const loaded = loadScenarios();
    if (loaded.length) setScenarios(loaded);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(msg: string) {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), TOAST_MS);
  }

  function listAll(): Scenario[] {
    if (scenarios.length) return scenarios;
    if (props.sampleData) {
      if (!sampleCache.current) sampleCache.current = samples();
      return sampleCache.current;
    }
    return [];
  }

  const visibleScenarios = listAll();
  const miss = missing(form);
  const sections = sectionsDone(form);
  const canCalculate = miss.length === 0;
  const spouseAffects = affects(form);

  function sf(patch: Partial<Form>) {
    const nextForm = { ...form, ...patch };
    setForm(nextForm);
    if (props.liveScoring && missing(nextForm).length === 0) {
      setResult({ ...compute(nextForm), stale: false });
      setCalculatedOnce(true);
    } else if (result) {
      setResult({ ...result, stale: true });
    }
  }

  function sfBand(group: 'l1' | 'l2' | 'sp', k: 's' | 'l' | 'r' | 'w', v: string) {
    sf({ [group]: { ...form[group], [k]: v } } as Partial<Form>);
  }

  function calculate() {
    const m = missing(form);
    if (m.length) {
      showToast('Still needed: ' + m[0] + (m.length > 1 ? ' +' + (m.length - 1) + ' more' : ''));
      return;
    }
    setResult({ ...compute(form), stale: false });
    setCalculatedOnce(true);
    track('calculated');
  }

  function save(asNew: boolean) {
    if (missing(form).length) {
      showToast('Fill in every section before saving');
      return;
    }
    const res = compute(form);
    const outcome = saveScenario({
      list: visibleScenarios,
      id: asNew ? null : currentId,
      name: saveName,
      form,
      result: res,
    });
    setScenarios(outcome.list);
    setCurrentId(outcome.id);
    setSaveName(outcome.name);
    setResult({ ...res, stale: false });
    setCalculatedOnce(true);
    persist(outcome.list);
    showToast((outcome.updated ? 'Updated' : 'Saved') + ' “' + outcome.name + '”');
    track('saved');
  }

  function load(s: Scenario) {
    setForm(JSON.parse(JSON.stringify(s.inputs)));
    setResult({ ...s.result, stale: false });
    setCurrentId(s.id);
    setSaveName(s.name);
    setView('calc');
    setCalculatedOnce(true);
    setConfirmDelete(null);
  }

  function del(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    const list = removeScenario(visibleScenarios, id);
    setScenarios(list);
    setCompareSel((prev) => prev.filter((x) => x !== id));
    setConfirmDelete(null);
    if (currentId === id) setCurrentId(null);
    persist(list);
    showToast('Scenario deleted');
  }

  function toggleSel(id: string) {
    setCompareSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    track('compared');
  }

  function startRename(id: string, name: string) {
    setEditName(id);
    setEditNameVal(name);
  }

  function commitName(id: string) {
    const name = (editNameVal || '').trim();
    if (!name) {
      setEditName(null);
      return;
    }
    const list = renameScenario(visibleScenarios, id, name);
    setScenarios(list);
    setEditName(null);
    persist(list);
  }

  function openClearAll() {
    setClearOpen(true);
    setClearText('');
  }

  function cancelClearAll() {
    setClearOpen(false);
    setClearText('');
  }

  function confirmClearAll() {
    const list = clearAllScenarios();
    setScenarios(list);
    setCompareSel([]);
    setClearOpen(false);
    setClearText('');
    setCurrentId(null);
    sampleCache.current = [];
    persist(list);
    showToast('All scenarios deleted');
  }

  function newScenario() {
    setForm(blankForm());
    setResult(null);
    setCurrentId(null);
    setSaveName('');
    setView('calc');
  }

  function dismissBanner() {
    setBannerDismissed(true);
  }

  function onDonate() {
    track('donate_clicked');
  }

  return {
    donateUrl: props.donateUrl ?? 'https://ko-fi.com/vincent69669',
    liveScoring: !!props.liveScoring,
    view, setView,
    form, sf, sfBand,
    result,
    calculate,
    scenarios: visibleScenarios,
    hasScenarios: visibleScenarios.length > 0,
    scenarioCount: visibleScenarios.length,
    currentId,
    saveName, setSaveName,
    save,
    load,
    del,
    confirmDelete,
    compareSel, toggleSel,
    baseline, setBaseline,
    editName, editNameVal, setEditNameVal, startRename, commitName,
    clearOpen, clearText, setClearText, openClearAll, cancelClearAll, confirmClearAll,
    toast, showToast,
    bannerDismissed, dismissBanner,
    calculatedOnce,
    missing: miss,
    sections,
    affects: spouseAffects,
    canCalculate,
    newScenario,
    onDonate,
  };
}

export type Planner = ReturnType<typeof usePlanner>;
