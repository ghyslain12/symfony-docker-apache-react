import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MaterialForm from '../../../../src/features/materials/components/MaterialForm.tsx';
import { AuthProvider } from '../../../../src/context/AuthContext.tsx';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('MaterialForm', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        localStorage.clear();
        vi.clearAllMocks();
        mockedNavigate.mockReset();
    });

    it('creates a new material successfully', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/material/add']}>
                        <Routes>
                            <Route path="/material/add" element={<MaterialForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        fireEvent.change(screen.getByLabelText(/Designation/i), { target: { value: 'New Material' } });
        fireEvent.click(screen.getByRole('button', { name: /Ajouter/i }));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/material');
        });
    });

    it('edits an existing material successfully', async () => {
        localStorage.setItem(
            'token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwizmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature'
        );

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/material/edit/1']}>
                        <Routes>
                            <Route path="/material/edit/:id" element={<MaterialForm />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        );

        await waitFor(
            () => {
                expect(screen.getByLabelText(/Designation/i)).toHaveValue('material 1');
            },
            { timeout: 3000 }
        );

        fireEvent.change(screen.getByLabelText(/Designation/i), { target: { value: 'Updated Material' } });
        fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/material');
        });
    });
});