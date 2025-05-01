import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '../../src/pages/HomePage';

describe('HomePage', () => {
    it('renders the welcome message and description', () => {
        render(<HomePage />);

        expect(screen.getByText('Bienvenue')).toBeInTheDocument();
        expect(
            screen.getByText('Gérez vos données facilement avec notre application CRUD')
        ).toBeInTheDocument();
    });

    it('renders all CRUD buttons', () => {
        render(<HomePage />);

        expect(screen.getByText('Créer')).toBeInTheDocument();
        expect(screen.getByText('Lire')).toBeInTheDocument();
        expect(screen.getByText('Modifier')).toBeInTheDocument();
        expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });

    it('renders the footer', () => {
        render(<HomePage />);

        expect(screen.getByText('© 2025 Application CRUD')).toBeInTheDocument();
    });
});