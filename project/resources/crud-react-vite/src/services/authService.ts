import apiService from "../../src/services/apiService";

interface LoginResponse {
    token: string;
    user: { id: number; name: string };
}

interface Credentials {
    email: string;
    password: string;
}

export const login = async (credentials: Credentials): Promise<LoginResponse> => {
    try {
        const response = await apiService.post<LoginResponse>('/login', credentials);

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        return response.data;
    } catch (error: any) {
        console.log('AuthService: Error during login:', error.message);
        if (error.response && error.response.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Erreur lors de la connexion');
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
    return !!getToken();
};