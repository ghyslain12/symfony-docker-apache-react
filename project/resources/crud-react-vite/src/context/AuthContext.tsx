import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { login as authServiceLogin, isAuthenticated as checkAuth } from '../services/authService';

interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const storedUser = localStorage.getItem('user');
    const initialUser = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

    const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
    const [user, setUser] = useState<any | null>(initialUser);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        const interval = setInterval(() => {
            const authStatus = checkAuth();
            if (!authStatus && isAuthenticated) {
                setIsAuthenticated(false);
                setUser(null);
                setToken(null);
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authServiceLogin(credentials);
            setUser(response.user);
            setToken(response.token);
            setIsAuthenticated(true);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}