import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ClientList from '../../../../src/features/clients/components/ClientList.tsx';
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

describe('ClientList', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('displays a list of clients when authenticated', async () => {
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
                        <ClientList />
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(
            () => {
                expect(screen.getByText(/client 1/i)).toBeInTheDocument();
                expect(screen.getByText(/client 2/i)).toBeInTheDocument();
                expect(screen.getByText(/utilisateur 1/i)).toBeInTheDocument();
                expect(screen.getByText(/utilisateur 2/i)).toBeInTheDocument();
            },
            { timeout: 5000 }
        );
    });
});