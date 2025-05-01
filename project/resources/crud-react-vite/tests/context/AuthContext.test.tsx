import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import * as authService from '../../src/services/authService';

const TestComponent = () => {
    const { isAuthenticated, user, token, login, logout } = useAuth();
    return (
        <div>
            <span data-testid="isAuthenticated">{isAuthenticated.toString()}</span>
            <span data-testid="user">{user ? user.name : 'null'}</span>
            <span data-testid="token">{token || 'null'}</span>
            <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
                Login
            </button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

vi.useFakeTimers();

describe('AuthContext', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockReset();
        localStorageMock.setItem.mockReset();
        localStorageMock.removeItem.mockReset();
        localStorageMock.clear.mockReset();

        vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
        vi.spyOn(authService, 'login').mockResolvedValue({
            token: 'mocked-token',
            user: { id: 1, name: 'John' },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
    });

    it('initial state is correct when no user is logged in', () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'user') return null;
            if (key === 'token') return null;
            return null;
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
        expect(screen.getByTestId('user').textContent).toBe('null');
        expect(screen.getByTestId('token').textContent).toBe('null');
    });

    it('initial state is correct when user is logged in', () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'user') return JSON.stringify({ id: 1, name: 'John' });
            if (key === 'token') return 'mocked-token';
            return null;
        });
        vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
        expect(screen.getByTestId('user').textContent).toBe('John');
        expect(screen.getByTestId('token').textContent).toBe('mocked-token');
    });

    it('logs in successfully and updates context', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'user') return null;
            if (key === 'token') return null;
            return null;
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await act(async () => {
            screen.getByText('Login').click();
        });

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
        expect(screen.getByTestId('user').textContent).toBe('John');
        expect(screen.getByTestId('token').textContent).toBe('mocked-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mocked-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: 1, name: 'John' }));
    });

    it('logs out and clears context', () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'user') return JSON.stringify({ id: 1, name: 'John' });
            if (key === 'token') return 'mocked-token';
            return null;
        });
        vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Logout').click();
        });

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
        expect(screen.getByTestId('user').textContent).toBe('null');
        expect(screen.getByTestId('token').textContent).toBe('null');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('useAuth throws error when used outside AuthProvider', () => {
        const TestComponentOutsideProvider = () => {
            useAuth();
            return null;
        };

        expect(() => render(<TestComponentOutsideProvider />)).toThrow('useAuth must be used within an AuthProvider');
    });

    it('logs out automatically when token is invalid after interval', () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'user') return JSON.stringify({ id: 1, name: 'John' });
            if (key === 'token') return 'mocked-token';
            return null;
        });
        vi.spyOn(authService, 'isAuthenticated')
            .mockReturnValueOnce(true) // Initialement authentifié
            .mockReturnValueOnce(false); // Plus authentifié après l'intervalle

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');

        act(() => {
            vi.advanceTimersByTime(60000);
        });

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
        expect(screen.getByTestId('user').textContent).toBe('null');
        expect(screen.getByTestId('token').textContent).toBe('null');
    });
});