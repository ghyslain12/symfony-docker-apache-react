import { vi, describe, it, expect, beforeEach } from 'vitest';
import { login, logout, getToken, getCurrentUser, isAuthenticated } from '../../src/services/authService';
import { server } from '../__mocks__/server';
import { http, HttpResponse } from 'msw';

interface LoginCredentials {
    email: string;
    password: string;
}

const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authService', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockReset();
        localStorageMock.setItem.mockReset();
        localStorageMock.removeItem.mockReset();
        localStorageMock.clear.mockReset();

        server.use(
            http.post('*/api/login', async ({ request }) => {
                const body = await request.json() as LoginCredentials;
                if (body.email === 'test@example.com' && body.password === 'password') {
                    return HttpResponse.json({
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature',
                        user: { id: 1, name: 'John' },
                    });
                }
                return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
            })
        );
    });

    it('successful login stores token and user in localStorage', async () => {
        const credentials = { email: 'test@example.com', password: 'password' };
        const response = await login(credentials);

        expect(response).toEqual({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature',
            user: { id: 1, name: 'John' },
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: 1, name: 'John' }));
    });

    it('logs out and clears localStorage', () => {
        logout();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('getToken returns the token from localStorage', () => {
        localStorageMock.getItem.mockReturnValue('mocked-token');
        expect(getToken()).toBe('mocked-token');
    });

    it('getCurrentUser returns the user from localStorage', () => {
        const user = { id: 1, name: 'John' };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        expect(getCurrentUser()).toEqual(user);
    });

    it('isAuthenticated returns true if token exists', () => {
        localStorageMock.getItem.mockReturnValue('mocked-token');
        expect(isAuthenticated()).toBe(true);
    });

    it('isAuthenticated returns false if token does not exist', () => {
        localStorageMock.getItem.mockReturnValue(null);
        expect(isAuthenticated()).toBe(false);
    });
});