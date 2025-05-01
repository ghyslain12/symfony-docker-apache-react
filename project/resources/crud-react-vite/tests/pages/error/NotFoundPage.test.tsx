import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../../../src/pages/error/NotFoundPage';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('NotFoundPage', () => {
    it('renders default message and title', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: '404 - Page non trouvée' })).toBeInTheDocument();
        expect(screen.getByText('Ressource non trouvée')).toBeInTheDocument();
    });

    it('renders custom message', () => {
        render(
            <MemoryRouter>
                <NotFoundPage message="Page introuvable" />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: '404 - Page non trouvée' })).toBeInTheDocument();
        expect(screen.getByText('Page introuvable')).toBeInTheDocument();
    });

    it('navigates back when the button is clicked', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Retour' }));
        expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
});