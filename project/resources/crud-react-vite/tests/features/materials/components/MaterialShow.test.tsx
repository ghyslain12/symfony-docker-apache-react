import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MaterialShow from '../../../../src/features/materials/components/MaterialShow.tsx';
import { AuthProvider } from '../../../../src/context/AuthContext.tsx';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('MaterialShow', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('displays material details when authenticated', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/material/view/1']}>
                        <Routes>
                            <Route path="/material/view/:id" element={<MaterialShow />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(
            () => {
                const nameElement = screen.getByText('material 1');
                expect(nameElement).toBeInTheDocument();
                expect(nameElement.parentElement?.textContent).toContain('Nom :');
            },
            { timeout: 3000 }
        );
    });
});