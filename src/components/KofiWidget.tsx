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
        '[id*="kofi-widget-overlay"] div, .floatingchat-container-wrap, .floatingchat-container-wrap-mobi { left: unset !important; right: 16px !important; } .floating-chat-kofi-popup-iframe, .floating-chat-kofi-popup-iframe-mobi { left: unset !important; right: 16px !important; }' +
        // Ko-fi's own stock CSS puts the popup 75px above the bottom edge, which is
        // shorter than the floating button's actual footprint (65px tall + 16px offset),
        // so the two overlap by ~6px. Bump the clearance so the panel sits fully above it.
        ' .floating-chat-kofi-popup-iframe, .floating-chat-kofi-popup-iframe-mobi { bottom: 100px !important; }' +
        // Ko-fi bug present even with stock positioning/sizing: the popup's inner iframe is
        // sized to 98% of the wrapper's height, but the "Powered by Ko-fi" notice footer
        // below it is 47px tall while only ~2% (~13px) is left for it, so the iframe's
        // bottom edge overlaps ~34px into the notice div, visually crossing its text.
        // Reserve the notice's actual height instead of relying on Ko-fi's 98%.
        ' .floating-chat-kofi-popup-iframe iframe, .floating-chat-kofi-popup-iframe-mobi iframe { height: calc(100% - 48px) !important; }';
      document.head.appendChild(fix);
    };
    document.body.appendChild(s);
  }, []);

  return null;
}
