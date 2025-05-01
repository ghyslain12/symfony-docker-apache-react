import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SaleList from '../../../../src/features/sales/components/SaleList.tsx';
import { AuthProvider, useAuth } from '../../../../src/context/AuthContext.tsx';

vi.mock('../../../../src/context/AuthContext.tsx', async () => {
    const actual = await vi.importActual('../../../../src/context/AuthContext.tsx');
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('SaleList', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('displays a list of sales when authenticated', async () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            logout: vi.fn(),
            user: null,
            token: null,
            login: vi.fn(),
        });

        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter>
                        <SaleList />
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
        }, { timeout: 5000 });

        await waitFor(() => {
            expect(screen.getByText('Liste des sales')).toBeInTheDocument();
            expect(screen.getByText('sale 1')).toBeInTheDocument();
            expect(screen.getByText('sale 2')).toBeInTheDocument();
            expect(screen.getByText('client 1')).toBeInTheDocument();
            expect(screen.getByText('client 2')).toBeInTheDocument();
            expect(screen.getByText('material 1')).toBeInTheDocument();
            expect(screen.getByText('material 2')).toBeInTheDocument();
        }, { timeout: 2000 });

        const viewButtons = screen.getAllByText('Voir');
        const editButtons = screen.getAllByText('Modifier');
        const deleteButtons = screen.getAllByText('Supprimer');

        expect(viewButtons).toHaveLength(2);
        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);

        await userEvent.click(viewButtons[0]);
        expect(mockedNavigate).toHaveBeenCalledWith('/sale/view/1');

        await userEvent.click(editButtons[1]);
        expect(mockedNavigate).toHaveBeenCalledWith('/sale/edit/2');

        window.confirm = vi.fn(() => true);
        await userEvent.click(deleteButtons[0]);
    });
});