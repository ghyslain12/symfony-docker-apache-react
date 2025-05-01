import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getById, create, update, getAll } from '../../../services/apiService';
import { Client } from '../types/client.types.ts';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import NotFoundPage from '../../../pages/error/NotFoundPage.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';
import { User } from '../../users/types/user.types.ts';

export default function ClientForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const initialFormData: Partial<Client> = { surnom: '', user_id: 0 };
    const [formData, setFormData] = useState<Partial<Client>>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof Client, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mutationError, setMutationError] = useState<string | null>(null);

    const { data: obj, error, isLoading } = useQuery({
        queryKey: ['obj', id],
        queryFn: async () => {
            if (id) {
                const response: AxiosResponse<Client> = await getById<Client>('/client', Number(id));
                return response.data;
            }
            return null;
        },
        staleTime: 0,
        enabled: !!id,
    });

    const { data: users, error: errorUser, isLoading: isLoadingUser } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response: AxiosResponse<User[]> = await getAll<User>('/utilisateur');
            return response.data;
        },
        staleTime: 0,
    });

    useEffect(() => {
        if (obj) {
            setFormData({
                surnom: obj.surnom,
                user_id: obj.user_id,
            });
        }
    }, [obj]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Client, string>> = {};

        if (!formData.surnom || formData.surnom.trim() === '') {
            newErrors.surnom = 'Le surnom est requis';
        }

        if (!formData.user_id || formData.user_id === 0) {
            newErrors.user_id = 'L’utilisateur est requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const mutation = useMutation({
        mutationFn: async (formData: Partial<Client>) => {
            const dataToSend: Partial<Client> = {
                surnom: formData.surnom,
                user_id: formData.user_id,
            };
            if (id) {
                const response = await update<Client>('/client', Number(id), dataToSend);
                return response.data;
            } else {
                const response = await create<Client>('/client', dataToSend);
                return response.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['objects'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['obj', id] });
            }
            setIsSubmitting(false);
            setMutationError(null);
            navigate('/client');
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue lors de l’enregistrement.';
            setMutationError(errorMessage);
            setIsSubmitting(false);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name as keyof Client]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleChangeUser = (event: SelectChangeEvent) => {
        const selectedUserId = Number(event.target.value);
        setFormData({ ...formData, user_id: selectedUserId });

        if (errors.user_id) {
            setErrors((prev) => ({ ...prev, user_id: '' }));
        }
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            setMutationError(null);
            mutation.mutate(formData);
        }
    };

    const loadingSpinner = useLoadingSpinner({ isLoading: isLoading || isLoadingUser });
    const { content: errorContent, isServerError } = useApiError({ error: error || errorUser });
    const mutationSpinner = useLoadingSpinner({ isLoading: isSubmitting || mutation.isPending });

    if (loadingSpinner || mutationSpinner) {
        return loadingSpinner || mutationSpinner;
    }

    if (errorContent) {
        if (!isServerError) {
            return <NotFoundPage message={`Client avec l'ID ${id} non trouvé`} />;
        }
        return errorContent;
    }

    return (
        <Box>
            <CustomMatButton
                variant="outlined"
                onClick={() => navigate('/client')}
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
                {id ? 'Modifier un client' : 'Ajouter un client'}
            </Typography>
            {mutationError && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {mutationError}
                </Typography>
            )}
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField
                    label="Surnom *"
                    name="surnom"
                    value={formData.surnom || ''}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    error={!!errors.surnom}
                    helperText={errors.surnom || ''}
                />
                <FormControl>
                    <InputLabel id="user-select-label">Utilisateur *</InputLabel>
                    <Select
                        labelId="user-select-label"
                        id="user-select"
                        value={formData.user_id ? String(formData.user_id) : ''}
                        onChange={handleChangeUser}
                        label="Utilisateur *"
                        inputProps={{ 'data-testid': 'user-select-input' }}
                    >
                        <MenuItem value="0">
                            <em>Sélectionner un utilisateur</em>
                        </MenuItem>
                        {users &&
                            users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                    </Select>
                    {errors.user_id && (
                        <Typography color="error" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            {errors.user_id}
                        </Typography>
                    )}
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <CustomMatButton
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting || mutation.isPending}
                    >
                        {id ? 'Modifier' : 'Ajouter'}
                    </CustomMatButton>
                    <CustomMatButton
                        variant="outlined"
                        onClick={() => navigate('/client')}
                        disabled={isSubmitting || mutation.isPending}
                    >
                        Annuler
                    </CustomMatButton>
                </Box>
            </Box>
        </Box>
    );
}