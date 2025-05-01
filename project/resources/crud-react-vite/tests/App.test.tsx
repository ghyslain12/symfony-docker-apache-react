import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from './__mocks__/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppContent } from '../src/App.tsx';
import LoginPage from '../src/pages/LoginPage.tsx';
import { AuthProvider } from '../src/context/AuthContext.tsx';

describe('App', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('allows access to app when JWT is disabled', async () => {
        server.use(
            http.get('http://localhost:8741/api/config/jwt', () => {
                return HttpResponse.json({ jwt_enabled: false });
            })
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/home']}>
                        <AppContent jwtEnabled={false} invalidate={vi.fn()} />
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Bienvenue')).toBeInTheDocument();
            expect(screen.getByText('Gérez vos données facilement avec notre application CRUD')).toBeInTheDocument();
        });
    });

    it('allows access to app when JWT is enabled and user is authenticated', async () => {
        server.use(
            http.get('http://localhost:8741/api/config/jwt', () => {
                return HttpResponse.json({ jwt_enabled: true });
            })
        );

        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature');
        localStorage.setItem('user', JSON.stringify({ id: 1, name: 'John' }));

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/home']}>
                        <AppContent jwtEnabled={true} invalidate={vi.fn()} />
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Bienvenue')).toBeInTheDocument();
        });
    });

    it('redirects to login when JWT is enabled and user is not authenticated', async () => {
        server.use(
            http.get('http://localhost:8741/api/config/jwt', () => {
                return HttpResponse.json({ jwt_enabled: true });
            })
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/home']}>
                        <AppContent jwtEnabled={true} invalidate={vi.fn()} />
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Connexion')).toBeInTheDocument();
        });
    });

    it('renders LoginPage with Connexion text', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </AuthProvider>
        );
        expect(screen.getByText('Connexion')).toBeInTheDocument();
    });
});