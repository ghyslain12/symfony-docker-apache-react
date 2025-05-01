import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getById } from '../../../services/apiService';
import { User } from '../types/user.types';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import NotFoundPage from '../../../pages/error/NotFoundPage.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';

export default function UserShow() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return <NotFoundPage message="ID utilisateur manquant dans l'URL" />;
    }

    const { data: obj, error, isLoading } = useQuery({
        queryKey: ['obj', id],
        queryFn: async () => {
            const response: AxiosResponse<User> = await getById<User>('/utilisateur', Number(id));
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
            return <NotFoundPage message={`Utilisateur avec l'ID ${id} non trouvé`} />;
        }
        return errorContent;
    }

    return (
        <Box sx={{ maxWidth: 400, padding: 2 }}>
            <CustomMatButton
                variant="outlined"
                onClick={() => navigate('/user')}
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
                Détails de l’utilisateur
            </Typography>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="body1" color="text.secondary">
                        <strong>Nom :</strong> {obj && obj.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        <strong>Email :</strong> {obj && obj.email}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}