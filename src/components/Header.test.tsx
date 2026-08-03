import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePlanner } from '../state/usePlanner';
import { Header } from './Header';

beforeEach(() => {
  localStorage.clear();
});

describe('Header', () => {
  it('renders no Donate button', () => {
    const { result } = renderHook(() => usePlanner());
    render(<Header planner={result.current} />);
    expect(screen.queryByText('Donate')).not.toBeInTheDocument();
  });
});
