import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TicketForm from '../../../../src/features/tickets/components/TicketForm.tsx';
import { AuthProvider } from '../../../../src/context/AuthContext.tsx';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('TicketForm', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('creates a new ticket successfully', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/ticket/add']}>
                        <Routes>
                            <Route path="/ticket/add" element={<TicketForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        }, { timeout: 5000 });

        await user.type(screen.getByLabelText(/Titre \*/i), 'Nouveau Ticket');
        await user.type(screen.getByLabelText(/Description \*/i), 'Description du nouveau ticket');

        const select = screen.getByLabelText(/Sale \*/i);
        await user.click(select);
        const option = screen.getByRole('option', { name: 'sale 1' });
        await user.click(option);

        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        await waitFor(
            () => {
                expect(mockedNavigate).toHaveBeenCalledWith('/ticket');
            },
            { timeout: 5000 }
        );
    });
});