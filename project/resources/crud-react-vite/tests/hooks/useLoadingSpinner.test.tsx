import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLoadingSpinner } from '../../src/hooks/useLoadingSpinner';

describe('useLoadingSpinner', () => {
    it('renders spinner when isLoading is true', () => {
        render(useLoadingSpinner({ isLoading: true }));

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('renders nothing when isLoading is false', () => {
        render(useLoadingSpinner({ isLoading: false }));

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
    });
});