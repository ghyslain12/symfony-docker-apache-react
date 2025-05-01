import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    component: React.ComponentType;
    jwtEnabled: boolean;
    isAuthenticated: boolean;
}

export default function ProtectedRoute({ component: Component, jwtEnabled, isAuthenticated }: ProtectedRouteProps) {
    useEffect(() => {
    }, [jwtEnabled, isAuthenticated]);

    if (jwtEnabled && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Component />;
}