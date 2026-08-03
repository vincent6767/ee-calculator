import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
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
});
