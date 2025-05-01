import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UserShow from '../../../../src/features/users/components/UserShow.tsx';
import { AuthProvider } from '../../../../src/context/AuthContext.tsx';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('UserShow', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('displays user details when authenticated', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/user/view/1']}>
                        <Routes>
                            <Route path="/user/view/:id" element={<UserShow />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(
            () => {
                const nameElement = screen.getByText((content: string, element: Element | null) => {
                    if (!element) return false;
                    if (element.tagName !== 'P') return false;
                    const hasText = element.textContent?.includes('Nom :') && element.textContent?.includes('utilisateur 1');
                    return hasText ?? false;
                });
                expect(nameElement).toBeInTheDocument();

                const emailElement = screen.getByText((content: string, element: Element | null) => {
                    if (!element) return false;
                    if (element.tagName !== 'P') return false;
                    const hasText = element.textContent?.includes('Email :') && element.textContent?.includes('utilisateur1@gmail.com');
                    return hasText ?? false;
                });
                expect(emailElement).toBeInTheDocument();
            },
            { timeout: 3000 }
        );
    });
});