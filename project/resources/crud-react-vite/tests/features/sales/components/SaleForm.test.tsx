import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SaleForm from '../../../../src/features/sales/components/SaleForm.tsx';
import { AuthProvider } from '../../../../src/context/AuthContext.tsx';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('SaleForm', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                    staleTime: 0,
                },
            },
        });

        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    afterEach(() => {
        queryClient.clear();
    });

    it('crée une nouvelle vente avec succès', async () => {
        const timeoutNumber = 15000;
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/sale/add']}>
                        <Routes>
                            <Route path="/sale/add" element={<SaleForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        }, { timeout: timeoutNumber });

        await user.type(screen.getByLabelText(/Titre \*/i), 'Nouvelle Vente');
        await user.type(screen.getByLabelText(/Description \*/i), 'Description de la nouvelle vente');

        const select = screen.getByLabelText(/Clients \*/i);
        await user.click(select);
        const option = screen.getByRole('option', { name: 'client 1' });
        await user.click(option);

        await waitFor(() => {
            const selectInput = screen.getByTestId('customer-select-input');
            expect(selectInput).toBeInTheDocument();
            expect(selectInput).toHaveValue('1');
        }, { timeout: timeoutNumber });

        const materialCheckbox = screen.getByLabelText(/material 1/i);
        await user.click(materialCheckbox);
        expect(materialCheckbox).toBeChecked();

        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        await waitFor(
            () => {
                expect(mockedNavigate).toHaveBeenCalledWith('/sale');
            },
            { timeout: timeoutNumber }
        );
    }, 30000);

    it('modifie une vente existante avec succès', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/sale/edit/1']}>
                        <Routes>
                            <Route path="/sale/edit/:id" element={<SaleForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        }, { timeout: 15000 });

        await waitFor(
            () => {
                expect(screen.getByLabelText(/Titre \*/i)).toHaveValue('sale 1');
                expect(screen.getByLabelText(/Description \*/i)).toHaveValue('description 1');
                const selectInput = screen.getByTestId('customer-select-input');
                expect(selectInput).toBeInTheDocument();
                expect(selectInput).toHaveValue('1');
                expect(screen.getByLabelText(/material 1/i)).toBeChecked();
                expect(screen.getByLabelText(/material 2/i)).not.toBeChecked();
            },
            { timeout: 15000 }
        );

        await user.clear(screen.getByLabelText(/Titre \*/i));
        await user.type(screen.getByLabelText(/Titre \*/i), 'Vente Modifiée');
        await user.clear(screen.getByLabelText(/Description \*/i));
        await user.type(screen.getByLabelText(/Description \*/i), 'Description modifiée');

        const select = screen.getByLabelText(/Clients \*/i);
        await user.click(select);
        const option = screen.getByRole('option', { name: 'client 2' });
        await user.click(option);

        await waitFor(() => {
            const selectInput = screen.getByTestId('customer-select-input');
            expect(selectInput).toHaveValue('2');
        }, { timeout: 2000 });

        const material1Checkbox = screen.getByLabelText(/material 1/i);
        await user.click(material1Checkbox);
        expect(material1Checkbox).not.toBeChecked();

        const material2Checkbox = screen.getByLabelText(/material 2/i);
        await user.click(material2Checkbox);
        expect(material2Checkbox).toBeChecked();

        await user.click(screen.getByRole('button', { name: /Modifier/i }));

        await waitFor(
            () => {
                expect(mockedNavigate).toHaveBeenCalledWith('/sale');
            },
            { timeout: 15000 }
        );
    }, 30000);

    it('affiche une erreur si le titre est vide lors de la création', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/sale/add']}>
                        <Routes>
                            <Route path="/sale/add" element={<SaleForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        }, { timeout: 15000 });

        await user.type(screen.getByLabelText(/Description \*/i), 'Description de la nouvelle vente');

        const select = screen.getByLabelText(/Clients \*/i);
        await user.click(select);
        const option = screen.getByRole('option', { name: 'client 1' });
        await user.click(option);

        const materialCheckbox = screen.getByLabelText(/material 1/i);
        await user.click(materialCheckbox);

        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        await waitFor(
            () => {
                expect(screen.getByText(/Le titre est requis/i)).toBeInTheDocument();
            },
            { timeout: 15000 }
        );

        expect(mockedNavigate).not.toHaveBeenCalled();
    }, 30000);
});