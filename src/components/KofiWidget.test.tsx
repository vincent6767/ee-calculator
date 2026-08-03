import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KofiWidget } from './KofiWidget';

function scripts() {
  return Array.from(document.querySelectorAll('script[src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"]'));
}

beforeEach(() => {
  window.__kofiLoaded = undefined;
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  (globalThis as unknown as { kofiWidgetOverlay: { draw: ReturnType<typeof vi.fn> } }).kofiWidgetOverlay = {
    draw: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
});

describe('KofiWidget', () => {
  it('injects exactly one script on mount', () => {
    render(<KofiWidget />);
    expect(scripts()).toHaveLength(1);
  });

  it('does not inject a second script on remount / StrictMode double-render', () => {
    render(<KofiWidget />);
    render(<KofiWidget />);
    expect(scripts()).toHaveLength(1);
  });

  it('calls kofiWidgetOverlay.draw with the handle and config on load', () => {
    render(<KofiWidget />);
    const script = scripts()[0] as HTMLScriptElement;
    script.onload?.(new Event('load'));
    expect(kofiWidgetOverlay.draw).toHaveBeenCalledWith('vincent69669', {
      'type': 'floating-chat',
      'floating-chat.donateButton.text': 'Support me',
      'floating-chat.donateButton.background-color': '#C2683C',
      'floating-chat.donateButton.text-color': '#fff',
    });
  });

  it('appends a style overriding position to the right', () => {
    render(<KofiWidget />);
    const script = scripts()[0] as HTMLScriptElement;
    script.onload?.(new Event('load'));
    const style = document.head.querySelector('style');
    expect(style?.textContent).toContain('right: 16px !important');
  });

  it('still appends the style if draw throws', () => {
    (globalThis as unknown as { kofiWidgetOverlay: { draw: ReturnType<typeof vi.fn> } }).kofiWidgetOverlay = {
      draw: vi.fn(() => {
        throw new Error('boom');
      }),
    };
    render(<KofiWidget />);
    const script = scripts()[0] as HTMLScriptElement;
    expect(() => script.onload?.(new Event('load'))).not.toThrow();
    const style = document.head.querySelector('style');
    expect(style?.textContent).toContain('right: 16px !important');
  });
});
