import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as apiServiceModule from '../../src/services/apiService';

const mockLocalStorage = {
    getItem: vi.fn(),
    removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

describe('apiService', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(apiServiceModule.default, { onNoMatch: 'throwException' });
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('test-token');
        mockLocalStorage.removeItem.mockImplementation(() => {});
        mockLocation.href = '';
        if (window.__MSW__?.server) {
            window.__MSW__.server.close();
        }
    });

    afterEach(() => {
        mock.reset();
        mock.restore();
        if (window.__MSW__?.server) {
            window.__MSW__.server.listen();
        }
    });

    describe('getAll', () => {
        it('successfully fetches data with Authorization header', async () => {
            const responseData = [{ id: 1, name: 'User' }];
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onGet('/utilisateur').reply(200, responseData, {
                'content-type': 'application/json',
            });

            const response: AxiosResponse<{ id: number; name: string }[]> = await apiServiceModule.getAll('/utilisateur');

            expect(response.data).toEqual(responseData);
            expect(mock.history.get[0].url).toBe('/utilisateur');
            expect(mock.history.get[0].headers?.Authorization).toBe('Bearer test-token');
        });

        it('handles 401 error with redirection', async () => {
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onGet('/utilisateur').reply(401, { message: 'Unauthorized' }, {
                'content-type': 'application/json',
            });

            await expect(apiServiceModule.getAll('/utilisateur')).rejects.toThrow('Erreur HTTP 401: Unauthorized');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
            expect(mockLocation.href).toBe('/login');
        });

        it('rejects non-JSON responses', async () => {
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onGet('/utilisateur').reply(200, 'not json', { 'content-type': 'text/plain' });

            await expect(apiServiceModule.getAll('/utilisateur')).rejects.toThrow('La réponse du serveur n\'est pas au format JSON');
        });

        it('handles network errors', async () => {
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onGet('/utilisateur').networkError();

            await expect(apiServiceModule.getAll('/utilisateur')).rejects.toThrow('Erreur réseau ou serveur indisponible');
        });
    });

    describe('getById', () => {
        it('fetches data by ID with Authorization header', async () => {
            const responseData = { id: 1, name: 'User' };
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onGet('/utilisateur/1').reply(200, responseData, {
                'content-type': 'application/json',
            });

            const response: AxiosResponse<{ id: number; name: string }> = await apiServiceModule.getById('/utilisateur', 1);

            expect(response.data).toEqual(responseData);
            expect(mock.history.get[0].url).toBe('/utilisateur/1');
            expect(mock.history.get[0].headers?.Authorization).toBe('Bearer test-token');
        });
    });

    describe('create', () => {
        it('posts data successfully', async () => {
            const newData = { name: 'New User', email: 'newuser@gmail.com' };
            const responseData = { id: 1, name: 'New User', email: 'newuser@gmail.com' };
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onPost('/utilisateur').reply(201, responseData, {
                'content-type': 'application/json',
            });

            const response: AxiosResponse<{ id: number; name: string; email: string }> = await apiServiceModule.create('/utilisateur', newData);

            expect(response.data).toEqual(responseData);
            expect(mock.history.post[0].url).toBe('/utilisateur');
            expect(JSON.parse(mock.history.post[0].data)).toEqual(newData);
            expect(mock.history.post[0].headers?.Authorization).toBe('Bearer test-token');
        });
    });

    describe('update', () => {
        it('updates data successfully', async () => {
            const updatedData = { name: 'Updated User', email: 'updated@gmail.com' };
            const responseData = { id: 1, name: 'Updated User', email: 'updated@gmail.com' };
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onPut('/utilisateur/1').reply(200, responseData, {
                'content-type': 'application/json',
            });

            const response: AxiosResponse<{ id: number; name: string; email: string }> = await apiServiceModule.update('/utilisateur', 1, updatedData);

            expect(response.data).toEqual(responseData);
            expect(mock.history.put[0].url).toBe('/utilisateur/1');
            expect(JSON.parse(mock.history.put[0].data)).toEqual(updatedData);
            expect(mock.history.put[0].headers?.Authorization).toBe('Bearer test-token');
        });
    });

    describe('deleteObj', () => {
        it('deletes data successfully', async () => {
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onDelete('/utilisateur/1').reply(204, null, {
                'content-type': 'application/json',
            });

            const response: AxiosResponse<void> = await apiServiceModule.deleteObj('/utilisateur', 1);

            expect(response.status).toBe(204);
            expect(mock.history.delete[0].url).toBe('/utilisateur/1');
            expect(mock.history.delete[0].headers?.Authorization).toBe('Bearer test-token');
        });
    });

    describe('Interceptors', () => {
        it('skips Authorization header for /config/jwt endpoint', async () => {
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onGet('/config/jwt').reply(200, { jwt_enabled: true }, {
                'content-type': 'application/json',
            });

            const response: AxiosResponse<{ jwt_enabled: boolean }> = await apiServiceModule.getConfig('/config/jwt');

            expect(response.data).toEqual({ jwt_enabled: true });
            expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
        });

        it('handles errors for /config/jwt without redirection', async () => {
            vi.spyOn(apiServiceModule, 'getAuthConfig').mockReturnValue({ jwtEnabled: true, token: 'test-token' });
            mock.onGet('/config/jwt').reply(500, { message: 'Server Error' }, {
                'content-type': 'application/json',
            });

            await expect(apiServiceModule.getConfig('/config/jwt')).rejects.toThrow('Erreur HTTP 500: Server Error');
            expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
            expect(mockLocation.href).not.toBe('/login');
        });
    });
});