import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UserForm from '../../../../src/features/users/components/UserForm.tsx';
import { AuthProvider } from '../../../../src/context/AuthContext.tsx';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('UserForm', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('crée un nouvel utilisateur avec succès', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/user/add']}>
                        <Routes>
                            <Route path="/user/add" element={<UserForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Nom \*/i), 'Nouvel Utilisateur');
        await user.type(screen.getByLabelText(/Email \*/i), 'nouvel.utilisateur@example.com');
        await user.type(screen.getByLabelText(/Mot de passe \*/i), 'password123');

        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        await waitFor(
            () => {
                expect(mockedNavigate).toHaveBeenCalledWith('/user');
            },
            { timeout: 5000 }
        );
    }, 10000);

    it('modifie un utilisateur existant avec succès', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/user/edit/1']}>
                        <Routes>
                            <Route path="/user/edit/:id" element={<UserForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await waitFor(
            () => {
                expect(screen.getByLabelText(/Nom \*/i)).toHaveValue('utilisateur 1');
                expect(screen.getByLabelText(/Email \*/i)).toHaveValue('utilisateur1@gmail.com');
            },
            { timeout: 5000 }
        );

        await user.clear(screen.getByLabelText(/Nom \*/i));
        await user.type(screen.getByLabelText(/Nom \*/i), 'Utilisateur Modifié');
        await user.clear(screen.getByLabelText(/Email \*/i));
        await user.type(screen.getByLabelText(/Email \*/i), 'modifie.utilisateur@example.com');

        await user.click(screen.getByRole('button', { name: /Modifier/i }));

        await waitFor(
            () => {
                expect(mockedNavigate).toHaveBeenCalledWith('/user');
            },
            { timeout: 5000 }
        );
    });

    it('affiche une erreur si l’email est invalide lors de la création', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/user/add']}>
                        <Routes>
                            <Route path="/user/add" element={<UserForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Nom \*/i), 'Nouvel Utilisateur');
        await user.type(screen.getByLabelText(/Email \*/i), 'email-invalide');
        await user.type(screen.getByLabelText(/Mot de passe \*/i), 'password123');

        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        await waitFor(
            () => {
                expect(screen.getByText(/L’email n’est pas valide/i)).toBeInTheDocument();
            },
            { timeout: 5000 }
        );

        expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('affiche une erreur si le mot de passe est trop court lors de la création', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/user/add']}>
                        <Routes>
                            <Route path="/user/add" element={<UserForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Nom \*/i), 'Nouvel Utilisateur');
        await user.type(screen.getByLabelText(/Email \*/i), 'nouvel.utilisateur@example.com');
        await user.type(screen.getByLabelText(/Mot de passe \*/i), 'pwd');

        await user.click(screen.getByRole('button', { name: /Ajouter/i }));

        await waitFor(
            () => {
                expect(screen.getByText(/Le mot de passe doit contenir au moins 4 caractères/i)).toBeInTheDocument();
            },
            { timeout: 5000 }
        );

        expect(mockedNavigate).not.toHaveBeenCalled();
    });
});