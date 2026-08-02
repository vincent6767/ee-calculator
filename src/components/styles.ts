// Shared style helpers matching the design handoff's inline styles verbatim
// (README "Design Tokens"; dc.html `pill`/`tab` methods).
import type { CSSProperties } from 'react';

export const colors = {
  bg: '#FAF6F0',
  card: '#FFFFFF',
  cardBorder: '#ECE3D4',
  divider: '#F0E8DA',
  dividerDashed: '#ECE3D4',
  text: '#3A3227',
  muted: '#8A7D6B',
  secondary: '#5C5142',
  faint: '#B7AB99',
  accent: '#C2683C',
  accentHover: '#A8552E',
  accentDeep: '#8A431F',
  accentTint: '#F8E7D9',
  neutralTint: '#F1E9DC',
  warnBg: '#FBF3E2',
  warnBorder: '#EAD9AC',
  warnText: '#7A683F',
  successBg: '#EDF4EC',
  successBorder: '#CFE3CD',
  successText: '#3E6B4A',
  deltaGreen: '#3E8E5F',
  deltaRed: '#C05B4D',
  toastBg: '#3A3227',
  toastText: '#FAF6F0',
};

export const headingFont = "'Bricolage Grotesque', sans-serif";

export const card: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.cardBorder}`,
  borderRadius: 20,
  padding: 26,
  boxShadow: '0 1px 2px rgba(60,45,25,0.04)',
};

export const cardHeading: CSSProperties = {
  fontFamily: headingFont,
  fontSize: 19,
  fontWeight: 700,
  margin: 0,
};

export const numberChip: CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 9,
  background: colors.accentTint,
  color: colors.accentHover,
  fontWeight: 700,
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

export const questionLabel: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#4A4234',
  marginBottom: 10,
};

export const helperText: CSSProperties = {
  fontSize: 13,
  color: colors.muted,
  marginBottom: 10,
};

export const selectStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1.5px solid #E7DECE',
  background: '#fff',
  fontSize: 14,
  fontFamily: 'inherit',
  color: colors.text,
};

export const smallSelectStyle: CSSProperties = {
  ...selectStyle,
  padding: '9px 10px',
  fontSize: 13.5,
};

export function pillStyle(selected: boolean, disabled = false): CSSProperties {
  return {
    padding: '9px 16px',
    borderRadius: 999,
    border: '1.5px solid ' + (selected ? colors.accent : '#E7DECE'),
    background: selected ? colors.accentTint : '#fff',
    color: disabled ? '#C4B9A7' : selected ? colors.accentDeep : colors.secondary,
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color .15s, background .15s',
  };
}

export function tabStyle(active: boolean): CSSProperties {
  return {
    border: 'none',
    background: active ? '#fff' : 'transparent',
    color: active ? colors.text : colors.muted,
    borderRadius: 999,
    padding: '8px 16px',
    fontWeight: 700,
    fontSize: 13.5,
    cursor: 'pointer',
    boxShadow: active ? '0 1px 4px rgba(60,45,25,0.12)' : 'none',
    display: 'flex',
    alignItems: 'center',
  };
}

export const solidButton: CSSProperties = {
  background: colors.accent,
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '11px 18px',
  fontWeight: 700,
  fontSize: 14,
  fontFamily: 'inherit',
  cursor: 'pointer',
};

export const outlineButton: CSSProperties = {
  background: '#fff',
  color: colors.accentHover,
  border: `1.5px solid ${colors.accent}`,
  borderRadius: 999,
  padding: '11px 16px',
  fontWeight: 700,
  fontSize: 13,
  fontFamily: 'inherit',
  cursor: 'pointer',
};
