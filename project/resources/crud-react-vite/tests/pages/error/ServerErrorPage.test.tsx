import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ServerErrorPage from '../../../src/pages/error/ServerErrorPage';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('ServerErrorPage', () => {
    it('renders default message and title', () => {
        render(
            <MemoryRouter>
                <ServerErrorPage />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Erreur serveur' })).toBeInTheDocument();
        const message = screen.getAllByText('Erreur serveur').find(el => el.tagName === 'P');
        expect(message).toBeInTheDocument();
    });

    it('renders custom message', () => {
        render(
            <MemoryRouter>
                <ServerErrorPage message="Problème interne" />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Erreur serveur' })).toBeInTheDocument();
        expect(screen.getByText('Problème interne')).toBeInTheDocument();
    });

    it('navigates back when the button is clicked', () => {
        render(
            <MemoryRouter>
                <ServerErrorPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Retour' }));
        expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
});