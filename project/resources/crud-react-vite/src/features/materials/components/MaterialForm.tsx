import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getById, create, update } from '../../../services/apiService';
import { Material } from '../types/material.types.ts';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import NotFoundPage from '../../../pages/error/NotFoundPage.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';

export default function MaterialForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const initialFormData: Partial<Material> = { designation: '' };
    const [formData, setFormData] = useState<Partial<Material>>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof Material, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: obj, error, isLoading } = useQuery({
        queryKey: ['obj', id],
        queryFn: async () => {
            if (id) {
                const response: AxiosResponse<Material> = await getById<Material>('/material', Number(id));
                return response.data;
            }
            return null;
        },
        staleTime: 0,
        enabled: !!id,
    });

    useEffect(() => {
        if (obj) {
            setFormData(obj);
        }
    }, [obj]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Material, string>> = {};

        if (!formData.designation || formData.designation.trim() === '') {
            newErrors.designation = 'La designation est requiss';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const mutation = useMutation({
        mutationFn: async (formData: Partial<Material>) => {
            if (id) {
                const response = await update<Material>('/material', Number(id), formData);
                return response.data;
            } else {
                const response = await create<Material>('/material', formData);
                return response.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objects'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['obj', id] });
            }
            setIsSubmitting(false);
            navigate('/material');
        },
        onError: (err: any) => {
            console.error('Erreur lors de l’enregistrement de le materiel :', err.message || 'Une erreur est survenue');
            setIsSubmitting(false);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors["designation" as keyof Material]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            mutation.mutate(formData);
        }
    };

    const loadingSpinner = useLoadingSpinner({ isLoading });
    const { content: errorContent, isServerError } = useApiError({ error });

    const mutationSpinner = useLoadingSpinner({ isLoading: isSubmitting || mutation.isPending });

    if (loadingSpinner || mutationSpinner) {
        return loadingSpinner || mutationSpinner;
    }

    if (errorContent) {
        if (!isServerError) {
            return <NotFoundPage message={`Materiel avec l'ID ${id} non trouvé`} />;
        }
        return errorContent;
    }

    return (
        <Box>
            <CustomMatButton variant="outlined" onClick={() => navigate('/material')}
                sx={{marginBottom: 6, display: 'block', textTransform: 'none', backgroundColor: '#3f51b5', color: 'white', '&:hover': { backgroundColor: '#4758b8' }}}>
                Retour
            </CustomMatButton>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {id ? 'Modifier un materiel' : 'Ajouter un materiel'}
            </Typography>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField label="Designation *" name="designation" value={formData.designation || ''} onChange={handleChange} variant="outlined" required error={!!errors.designation} helperText={errors.designation || ''} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <CustomMatButton variant="contained" onClick={handleSubmit} disabled={isSubmitting || mutation.isPending}>
                        {id ? 'Modifier' : 'Ajouter'}
                    </CustomMatButton>
                    <CustomMatButton variant="outlined" onClick={() => navigate('/material')} disabled={isSubmitting || mutation.isPending}>
                        Annuler
                    </CustomMatButton>
                </Box>
            </Box>
        </Box>
    );
}