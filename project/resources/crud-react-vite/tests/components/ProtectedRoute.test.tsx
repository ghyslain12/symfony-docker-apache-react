import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';

const TestComponent = () => <div>Test Component</div>;
const LoginComponent = () => <div>Login Page</div>;

describe('ProtectedRoute', () => {
    it('redirects to login when jwtEnabled is true and not authenticated', () => {
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute
                                component={TestComponent}
                                jwtEnabled={true}
                                isAuthenticated={false}
                            />
                        }
                    />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
    });

    it('renders component when jwtEnabled is false', () => {
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute
                                component={TestComponent}
                                jwtEnabled={false}
                                isAuthenticated={false}
                            />
                        }
                    />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Test Component')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('renders component when authenticated', () => {
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute
                                component={TestComponent}
                                jwtEnabled={true}
                                isAuthenticated={true}
                            />
                        }
                    />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Test Component')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
});