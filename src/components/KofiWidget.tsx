import { useEffect } from 'react';

declare global {
  interface Window {
    __kofiLoaded?: boolean;
  }
  const kofiWidgetOverlay: { draw(handle: string, opts: Record<string, string>): void };
}

export function KofiWidget() {
  useEffect(() => {
    if (window.__kofiLoaded) return;
    window.__kofiLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    s.onload = () => {
      try {
        kofiWidgetOverlay.draw('vincent69669', {
          'type': 'floating-chat',
          'floating-chat.donateButton.text': 'Support me',
          'floating-chat.donateButton.background-color': '#C2683C',
          'floating-chat.donateButton.text-color': '#fff',
        });
      } catch (e) {}
      const fix = document.createElement('style');
      fix.textContent =
        '[id*="kofi-widget-overlay"] div, .floatingchat-container-wrap, .floatingchat-container-wrap-mobi { left: unset !important; right: 16px !important; } .floating-chat-kofi-popup-iframe, .floating-chat-kofi-popup-iframe-mobi { left: unset !important; right: 16px !important; }';
      document.head.appendChild(fix);
    };
    document.body.appendChild(s);
  }, []);

  return null;
}
