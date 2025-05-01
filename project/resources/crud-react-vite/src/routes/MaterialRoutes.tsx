import { Routes, Route } from 'react-router-dom';
import MaterialList from '../features/materials/components/MaterialList.tsx';
import MaterialForm from '../features/materials/components/MaterialForm.tsx';
import MaterialShow from '../features/materials/components/MaterialShow.tsx';
import NotFoundPage from '../pages/error/NotFoundPage.tsx';

export default function MaterialRoutes() {
    return (
        <Routes>
            <Route path="/" element={<MaterialList />} />
            <Route path="/add" element={<MaterialForm />} />
            <Route path="/edit/:id" element={<MaterialForm />} />
            <Route path="/view/:id" element={<MaterialShow />} />
            <Route path="*" element={<NotFoundPage message="Page non trouvée" />} />
        </Routes>
    );
}