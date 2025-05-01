import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ClientRoutes from './routes/ClientRoutes.tsx';
import SaleRoutes from './routes/SaleRoutes.tsx';
import UserRoutes from './routes/UserRoutes.tsx';
import TicketRoutes from './routes/TicketRoutes.tsx';
import MaterialRoutes from './routes/MaterialRoutes.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import LoginPage from './pages/LoginPage.tsx';
import HomePage from './pages/HomePage.tsx';
import NotFoundPage from './pages/error/NotFoundPage.tsx';
import apiService from './services/apiService.ts';
import { useLoadingSpinner } from './hooks/useLoadingSpinner.tsx';

export const AppContent = React.memo(({ jwtEnabled, invalidate }: { jwtEnabled: boolean; invalidate: () => void }) => {
    const { isAuthenticated } = useAuth();
    const protectedProps = React.useMemo(() => ({ jwtEnabled, isAuthenticated, invalidate }), [jwtEnabled, isAuthenticated, invalidate]);

    return (
        <MainLayout jwtEnabled={jwtEnabled} invalidate={invalidate}>
            <Routes>
                <Route path="/" element={jwtEnabled && isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} />
                <Route path="/login" element={jwtEnabled && isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} />
                <Route path="/home" element={<ProtectedRoute component={HomePage} {...protectedProps} />} />
                <Route path="/sale/*" element={<ProtectedRoute component={SaleRoutes} {...protectedProps} />} />
                <Route path="/ticket/*" element={<ProtectedRoute component={TicketRoutes} {...protectedProps} />} />
                <Route path="/user/*" element={<UserRoutes jwtEnabled={jwtEnabled} invalidate={invalidate} />} />
                <Route path="/client/*" element={<ProtectedRoute component={ClientRoutes} {...protectedProps} />} />
                <Route path="/material/*" element={<ProtectedRoute component={MaterialRoutes} {...protectedProps} />} />
                <Route path="*" element={<NotFoundPage message="Page non trouvée" />} />
            </Routes>
        </MainLayout>
    );
});

export default function App() {
    const [jwtEnabled, setJwtEnabled] = useState(false);
    const fetchJwtConfig = useCallback(async () => {
        try {
            const response = await apiService.get('/config/jwt');

            // Gestion des formats de réponse variés
            let jwtEnabledValue: boolean;
            if (typeof response.data.jwt_enabled === 'boolean') {
                jwtEnabledValue = response.data.jwt_enabled;
            } else if (typeof response.data.jwt_enabled === 'string') {
                jwtEnabledValue = response.data.jwt_enabled.toLowerCase() === 'true';
            } else {
                throw new Error("Réponse invalide de /config/jwt : jwt_enabled n'est pas un booléen ou une chaîne valide");
            }

            setJwtEnabled(jwtEnabledValue);
        } catch (err: any) {
            console.error('Failed to fetch JWT config:', err.message);
            console.error('Failed to fetch JWT config (full error):', err);
            setJwtEnabled(false);
        }
    }, []);

    useEffect(() => {
        fetchJwtConfig();
    }, [fetchJwtConfig]);

    const invalidate = useCallback(() => {
        setJwtEnabled(false);
        fetchJwtConfig();
    }, [fetchJwtConfig]);

    const isLoading = true;
    const loadingSpinner = useLoadingSpinner({ isLoading });

    return (
        <Router>
            <Suspense fallback={loadingSpinner}>
                <AppContent jwtEnabled={jwtEnabled} invalidate={invalidate} />
            </Suspense>
        </Router>
    );
}