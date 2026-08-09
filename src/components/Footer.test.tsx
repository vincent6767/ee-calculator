import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlanner } from '../state/usePlanner';
import { Footer } from './Footer';

beforeEach(() => {
  localStorage.clear();
});

describe('Footer', () => {
  it('renders the tip link with the default Ko-fi handle URL', () => {
    const { result } = renderHook(() => usePlanner());
    render(<Footer planner={result.current} />);
    const link = screen.getByText('♥ Support this tool with a tip');
    expect(link).toHaveAttribute('href', 'https://ko-fi.com/vincent69669');
  });

  it('renders the disclaimer text', () => {
    const { result } = renderHook(() => usePlanner());
    render(<Footer planner={result.current} />);
    expect(screen.getByText(/not immigration advice/)).toBeInTheDocument();
  });

  describe('feedback button', () => {
    afterEach(() => {
      delete (window as unknown as { plausible?: unknown }).plausible;
    });

    it('renders the feedback link with the default mailto href', () => {
      const { result } = renderHook(() => usePlanner());
      render(<Footer planner={result.current} />);
      const link = screen.getByText('Report an issue or send feedback');
      expect(link).toHaveAttribute(
        'href',
        'mailto:vincentmok94+crsscenarios@gmail.com?subject=CRS%20Planner%20feedback'
      );
    });

    it('follows a custom feedbackUrl', () => {
      const { result } = renderHook(() => usePlanner({ feedbackUrl: 'mailto:someone@example.com' }));
      render(<Footer planner={result.current} />);
      const link = screen.getByText('Report an issue or send feedback');
      expect(link).toHaveAttribute('href', 'mailto:someone@example.com');
    });

    it('fires feedback_clicked analytics on click', () => {
      const plausible = vi.fn();
      (window as unknown as { plausible: typeof plausible }).plausible = plausible;

      const { result } = renderHook(() => usePlanner());
      render(<Footer planner={result.current} />);
      const link = screen.getByText('Report an issue or send feedback');
      // jsdom doesn't implement real anchor navigation; preventDefault stops it from
      // trying (and logging a spurious error) without affecting React's onClick, which
      // fires on bubble via a delegated listener at the root.
      link.addEventListener('click', (e) => e.preventDefault());
      link.click();

      expect(plausible).toHaveBeenCalledWith('feedback_clicked');
    });

    it('renders the reproduction hint below the button', () => {
      const { result } = renderHook(() => usePlanner());
      render(<Footer planner={result.current} />);
      expect(
        screen.getByText('Spot a scoring issue? Include the test type and bands you entered so we can reproduce it.')
      ).toBeInTheDocument();
    });
  });
});
