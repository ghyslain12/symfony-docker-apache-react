import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getById } from '../../../services/apiService';
import { Sale } from '../types/sale.types.ts';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import NotFoundPage from '../../../pages/error/NotFoundPage.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';

export default function SaleShow() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return <NotFoundPage message="ID sale manquant dans l'URL" />;
    }

    const { data: obj, error, isLoading } = useQuery({
        queryKey: ['obj', id],
        queryFn: async () => {
            const response: AxiosResponse<Sale> = await getById<Sale>('/sale', Number(id));
            return response.data;
        },
        staleTime: 0,
    });

    const loadingSpinner = useLoadingSpinner({ isLoading });
    const { content: errorContent, isServerError } = useApiError({ error });

    if (loadingSpinner) {
        return loadingSpinner;
    }

    if (errorContent) {
        if (!isServerError) {
            return <NotFoundPage message={`Sale avec l'ID ${id} non trouvé`} />;
        }
        return errorContent;
    }

    if (!obj) {
        return <NotFoundPage message={`Sale avec l'ID ${id} non trouvé`} />;
    }

    return (
        <Box sx={{ maxWidth: 400, padding: 2 }}>
            <CustomMatButton
                variant="outlined"
                onClick={() => navigate('/sale')}
                sx={{
                    marginBottom: 6,
                    display: 'block',
                    textTransform: 'none',
                    backgroundColor: '#3f51b5',
                    color: 'white',
                    '&:hover': { backgroundColor: '#4758b8' },
                }}
            >
                Retour
            </CustomMatButton>
            <Typography variant="h5" component="div" gutterBottom sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                Détails de la sale
            </Typography>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="body1" color="text.secondary">
                        <strong>Titre :</strong> {obj.titre ?? 'N/A'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        <strong>Description :</strong> {obj.description ?? 'N/A'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        <strong>Client :</strong> {obj.customer?.surnom ?? 'N/A'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        <strong>Materiels :</strong>
                    </Typography>
                    {obj.materials?.length ? (
                        obj.materials.map((materiel, index) => (
                            <Typography key={`${obj.id}-material-${index}`} variant="body1" color="text.secondary">
                                {materiel?.designation ?? 'N/A'}
                            </Typography>
                        ))
                    ) : (
                        <Typography variant="body1" color="text.secondary">Aucun matériel</Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}