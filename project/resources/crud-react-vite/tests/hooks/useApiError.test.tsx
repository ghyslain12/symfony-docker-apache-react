import {render, renderHook, screen} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useApiError } from '../../src/hooks/useApiError';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe('useApiError', () => {
    it('returns null content when no error', () => {
        const { result } = renderHook(() => useApiError({ error: null }));
        expect(result.current.content).toBeNull();
        expect(result.current.isServerError).toBe(false);
    });

    it('renders ServerErrorPage for 5xx errors', () => {
        const error = new AxiosError('Server Error', '500', undefined, undefined, {
            status: 500,
            data: { message: 'Internal Server Error' },
        } as any);

        const { result } = renderHook(() => useApiError({ error }));
        render(<MemoryRouter>{result.current.content}</MemoryRouter>);

        expect(screen.getByRole('heading', { name: 'Erreur serveur' })).toBeInTheDocument();
        expect(screen.getByText('Erreur serveur: Internal Server Error')).toBeInTheDocument();
        expect(result.current.isServerError).toBe(true);
    });

    it('renders ServerErrorPage for generic errors', () => {
        const error = new AxiosError('Network Error', undefined, undefined, undefined, undefined);
        const { result } = renderHook(() => useApiError({ error }));
        render(<MemoryRouter>{result.current.content}</MemoryRouter>);

        expect(screen.getByRole('heading', { name: 'Erreur serveur' })).toBeInTheDocument();
        expect(screen.getByText('Erreur: Network Error')).toBeInTheDocument();
        expect(result.current.isServerError).toBe(false);
    });
});