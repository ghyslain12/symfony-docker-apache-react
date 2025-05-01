import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ClientForm from '../../../../src/features/clients/components/ClientForm.tsx';
import { AuthProvider } from '../../../../src/context/AuthContext.tsx';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('ClientForm', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('creates a new client successfully', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/client/add']}>
                        <Routes>
                            <Route path="/client/add" element={<ClientForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        }, { timeout: 5000 });

        await user.type(screen.getByLabelText(/Surnom/i), 'New Client');

        const select = screen.getByLabelText(/Utilisateur/i);
        await user.click(select);
        const option = screen.getByRole('option', { name: 'utilisateur 1' });
        await user.click(option);

        await waitFor(() => {
            expect(screen.getByLabelText(/Utilisateur/i)).toHaveTextContent('utilisateur 1');
        }, { timeout: 2000 });

        await waitFor(() => {
            const selectInput = screen.getByTestId('user-select-input');
            expect(selectInput).toBeInTheDocument();
            expect(selectInput).toHaveValue('1');
        }, { timeout: 2000 });

        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        await waitFor(
            () => {
                expect(mockedNavigate).toHaveBeenCalledWith('/client');
            },
            { timeout: 5000 }
        );
    });

    it('edits an existing client successfully', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/client/edit/1']}>
                        <Routes>
                            <Route path="/client/edit/:id" element={<ClientForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        }, { timeout: 5000 });

        await waitFor(
            () => {
                expect(screen.getByLabelText(/Surnom/i)).toHaveValue('client 1');
                const selectInput = screen.getByTestId('user-select-input');
                expect(selectInput).toBeInTheDocument();
                expect(selectInput).toHaveValue('1');
            },
            { timeout: 3000 }
        );

        await user.clear(screen.getByLabelText(/Surnom/i));
        await user.type(screen.getByLabelText(/Surnom/i), 'Updated Client');

        const select = screen.getByLabelText(/Utilisateur/i);
        await user.click(select);
        const option = screen.getByRole('option', { name: 'utilisateur 2' });
        await user.click(option);

        await waitFor(() => {
            expect(screen.getByLabelText(/Utilisateur/i)).toHaveTextContent('utilisateur 2');
        }, { timeout: 2000 });

        await waitFor(() => {
            const selectInputAfterChange = screen.getByTestId('user-select-input');
            expect(selectInputAfterChange).toBeInTheDocument();
            expect(selectInputAfterChange).toHaveValue('2');
        }, { timeout: 2000 });

        await user.click(screen.getByRole('button', { name: /Modifier/i }));

        await waitFor(
            () => {
                expect(mockedNavigate).toHaveBeenCalledWith('/client');
            },
            { timeout: 5000 }
        );
    });
});