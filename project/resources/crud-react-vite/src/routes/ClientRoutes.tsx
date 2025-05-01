import { Routes, Route } from 'react-router-dom';
import ClientList from '../features/clients/components/ClientList.tsx';
import ClientForm from '../features/clients/components/ClientForm.tsx';
import ClientShow from '../features/clients/components/ClientShow.tsx';
import NotFoundPage from '../pages/error/NotFoundPage.tsx';


export default function ClientRoutes() {
    return (
        <Routes>
            <Route path="/" element={<ClientList />} />
            <Route path="/add" element={<ClientForm />} />
            <Route path="/edit/:id" element={<ClientForm />} />
            <Route path="/view/:id" element={<ClientShow />} />
            <Route path="*" element={<NotFoundPage message="Page non trouvée" />} />
        </Routes>
    );
}