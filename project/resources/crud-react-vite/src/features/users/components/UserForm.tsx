import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getById, create, update } from '../../../services/apiService';
import { User } from '../types/user.types';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import NotFoundPage from '../../../pages/error/NotFoundPage.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';

export default function UserForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const initialFormData: Partial<User> = { name: '', email: '', password: '' };
    const [formData, setFormData] = useState<Partial<User>>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: obj, error, isLoading } = useQuery({
        queryKey: ['obj', id],
        queryFn: async () => {
            if (id) {
                const response: AxiosResponse<User> = await getById<User>('/utilisateur', Number(id));
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
        const newErrors: Partial<Record<keyof User, string>> = {};

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'Le nom est requis';
        }

        if (!formData.email || formData.email.trim() === '') {
            newErrors.email = 'L’email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'L’email n’est pas valide';
        }

        if (!id && (!formData.password || formData.password.trim() === '')) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (!id && formData.password && formData.password.length < 4) {
            newErrors.password = 'Le mot de passe doit contenir au moins 4 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const mutation = useMutation({
        mutationFn: async (formData: Partial<User>) => {
            if (id) {
                const response = await update<User, Partial<User>>('/utilisateur', Number(id), formData);
                return response.data;
            } else {
                const response = await create<User, Partial<User>>('/utilisateur', formData);
                return response.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objects'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['obj', id] });
            }
            setIsSubmitting(false);
            navigate('/user');
        },
        onError: () => {
            setIsSubmitting(false);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name as keyof User]) {
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
            return <NotFoundPage message={`Utilisateur avec l'ID ${id} non trouvé`} />;
        }
        return errorContent;
    }

    return (
        <Box>
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
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {id ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
            </Typography>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField
                    label="Nom *"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    error={!!errors.name}
                    helperText={errors.name || ''}
                />
                <TextField
                    label="Email *"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email || ''}
                />
                {!id && (
                    <TextField
                        label="Mot de passe *"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        type="password"
                        error={!!errors.password}
                        helperText={errors.password || ''}
                    />
                )}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <CustomMatButton variant="contained" onClick={handleSubmit} disabled={isSubmitting || mutation.isPending}>
                        {id ? 'Modifier' : 'Ajouter'}
                    </CustomMatButton>
                    <CustomMatButton
                        variant="outlined"
                        onClick={() => navigate('/user')}
                        disabled={isSubmitting || mutation.isPending}
                    >
                        Annuler
                    </CustomMatButton>
                </Box>
            </Box>
        </Box>
    );
}