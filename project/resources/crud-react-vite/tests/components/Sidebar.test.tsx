import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../src/components/Sidebar';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../src/components/CustomMatButton', () => ({
    default: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

vi.mock('../../src/context/AuthContext', async () => {
    const actual = await vi.importActual('../../src/context/AuthContext');
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

describe('Sidebar', () => {
    const renderWithProviders = (
        isAuthenticated: boolean,
        jwtEnabled: boolean,
        logout: () => void = vi.fn()
    ) => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated,
            logout,
            user: null,
            token: null,
            login: vi.fn(),
        });
        return render(
            <MemoryRouter>
                <AuthProvider>
                    <Sidebar jwtEnabled={jwtEnabled} invalidate={vi.fn()} />
                </AuthProvider>
            </MemoryRouter>
        );
    };

    it('renders when jwtEnabled is false', () => {
        renderWithProviders(false, false);
        expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('renders menu items when jwtEnabled is true', () => {
        renderWithProviders(true, true);
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Provisioning')).toBeInTheDocument();
        expect(screen.getByText('sale')).toBeInTheDocument();
        expect(screen.getByText('Ticketing')).toBeInTheDocument();
        expect(screen.getByText('ticket')).toBeInTheDocument();
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('user')).toBeInTheDocument();
        expect(screen.getByText('client')).toBeInTheDocument();
        expect(screen.getByText('Materials')).toBeInTheDocument();
        expect(screen.getByText('material')).toBeInTheDocument();
    });

    it('renders logout button when authenticated', () => {
        renderWithProviders(true, true);
        expect(screen.getByRole('button', { name: /Déconnexion/i })).toBeInTheDocument();
    });

    it('does not render logout button when not authenticated', () => {
        renderWithProviders(false, true);
        expect(screen.queryByRole('button', { name: /Déconnexion/i })).not.toBeInTheDocument();
    });

    it('toggles submenu on click', () => {
        renderWithProviders(true, true);
        const provisioningItem = screen.getByText('Provisioning');
        const saleLink = screen.getByText('sale');

        expect(saleLink).toBeVisible();

        fireEvent.click(provisioningItem);
        expect(saleLink.closest('ul')).toHaveClass('closed');

        fireEvent.click(provisioningItem);
        expect(saleLink.closest('ul')).toHaveClass('open');
    });

    it('navigates to correct route on menu item click', () => {
        renderWithProviders(true, true);
        const homeLink = screen.getByText('Home');
        fireEvent.click(homeLink);
        expect(homeLink).toHaveAttribute('href', '/home');
    });

    it('handles logout correctly', async () => {
        const mockLogout = vi.fn();
        renderWithProviders(true, true, mockLogout);
        const logoutButton = screen.getByRole('button', { name: /Déconnexion/i });
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });
});