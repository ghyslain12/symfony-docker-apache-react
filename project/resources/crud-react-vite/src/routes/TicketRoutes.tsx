import { Routes, Route } from 'react-router-dom';
import TicketList from '../features/tickets/components/TicketList.tsx';
import TicketForm from '../features/tickets/components/TicketForm.tsx';
import TicketShow from '../features/tickets/components/TicketShow.tsx';
import NotFoundPage from '../pages/error/NotFoundPage.tsx';

export default function TicketRoutes() {
    return (
        <Routes>
            <Route path="/" element={<TicketList />} />
            <Route path="/add" element={<TicketForm />} />
            <Route path="/edit/:id" element={<TicketForm />} />
            <Route path="/view/:id" element={<TicketShow />} />
            <Route path="*" element={<NotFoundPage message="Page non trouvée" />} />
        </Routes>
    );
}