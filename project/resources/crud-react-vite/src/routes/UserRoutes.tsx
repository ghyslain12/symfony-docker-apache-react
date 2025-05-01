import { Routes, Route, Navigate } from 'react-router-dom';
import UserList from '../features/users/components/UserList.tsx';
import UserForm from '../features/users/components/UserForm.tsx';
import UserShow from '../features/users/components/UserShow.tsx';
import NotFoundPage from '../pages/error/NotFoundPage.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export default function UserRoutes({ jwtEnabled, invalidate }: RoutesProps) {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/" element={jwtEnabled && !isAuthenticated ? <Navigate to="/login" replace /> : <UserList />} />
            <Route path="/add" element={<UserForm />} />
            <Route path="/edit/:id" element={jwtEnabled && !isAuthenticated ? <Navigate to="/login" replace /> : <UserForm />} />
            <Route path="/view/:id" element={jwtEnabled && !isAuthenticated ? <Navigate to="/login" replace /> : <UserShow />} />
            <Route path="*" element={<NotFoundPage message="Page non trouvée" />} />
        </Routes>
    );
}