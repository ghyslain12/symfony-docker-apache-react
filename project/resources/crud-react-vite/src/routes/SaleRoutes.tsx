import { Routes, Route } from 'react-router-dom';
import SaleList from '../features/sales/components/SaleList.tsx';
import SaleForm from '../features/sales/components/SaleForm.tsx';
import SaleShow from '../features/sales/components/SaleShow.tsx';
import NotFoundPage from '../pages/error/NotFoundPage.tsx';

export default function SaleRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SaleList />} />
            <Route path="/add" element={<SaleForm />} />
            <Route path="/edit/:id" element={<SaleForm />} />
            <Route path="/view/:id" element={<SaleShow />} />
            <Route path="*" element={<NotFoundPage message="Page non trouvée" />} />
        </Routes>
    );
}