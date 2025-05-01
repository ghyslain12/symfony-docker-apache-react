import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TicketShow from '../../../../src/features/tickets/components/TicketShow.tsx';
import { AuthProvider } from '../../../../src/context/AuthContext.tsx';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('TicketShow', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('displays ticket details', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/ticket/view/1']}>
                        <Routes>
                            <Route path="/ticket/view/:id" element={<TicketShow />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        }, { timeout: 5000 });

        await waitFor(() => {
            expect(screen.getByText('Détails du ticket')).toBeInTheDocument();
            expect(screen.getByText('ticket 1')).toBeInTheDocument();
            expect(screen.getByText('description 1')).toBeInTheDocument();
            expect(screen.getByText('sale 1')).toBeInTheDocument();
        }, { timeout: 2000 });

        await userEvent.click(screen.getByRole('button', { name: /Retour/i }));
        expect(mockedNavigate).toHaveBeenCalledWith('/ticket');
    });

    it('displays not found page when id is missing', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/ticket/view']}>
                        <Routes>
                            <Route path="/ticket/view" element={<TicketShow />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        expect(screen.getByText('ID ticket manquant dans l\'URL')).toBeInTheDocument();
    });
});