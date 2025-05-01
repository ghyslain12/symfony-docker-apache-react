import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getById, create, update, getAll } from '../../../services/apiService';
import { Ticket } from '../types/ticket.types.ts';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import NotFoundPage from '../../../pages/error/NotFoundPage.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';
import { Sale } from '../../sales/types/sale.types.ts';

export default function TicketForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const initialFormData: Partial<Ticket> = { titre: '', description: '', sale_id: undefined };
    const [formData, setFormData] = useState<Partial<Ticket>>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof Ticket, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mutationError, setMutationError] = useState<string | null>(null);

    const { data: obj, error, isLoading } = useQuery({
        queryKey: ['obj', id],
        queryFn: async () => {
            if (id) {
                const response: AxiosResponse<Ticket> = await getById<Ticket>('/ticket', Number(id));
                return response.data;
            }
            return null;
        },
        staleTime: 0,
        enabled: !!id,
    });

    const { data: sales, error: errorUser, isLoading: isLoadingUser } = useQuery({
        queryKey: ['sales'],
        queryFn: async () => {
            const response: AxiosResponse<Sale[]> = await getAll<Sale>('/sale');
            return response.data;
        },
        staleTime: 0,
    });

    useEffect(() => {
        if (obj) {
            const derivedSaleId = obj.sale_id || (obj.sales && obj.sales.length > 0 ? obj.sales[0].id : undefined);
            setFormData({
                titre: obj.titre,
                description: obj.description,
                sale_id: derivedSaleId,
            });
        }
    }, [obj]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Ticket, string>> = {};

        if (!formData.titre || formData.titre.trim() === '') {
            newErrors.titre = 'Le titre est requis';
        }

        if (!formData.description || formData.description.trim() === '') {
            newErrors.description = 'La description est requise';
        }

        if (formData.sale_id === undefined || formData.sale_id === 0) {
            newErrors.sale_id = 'La sale est requise';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const mutation = useMutation({
        mutationFn: async (formData: Partial<Ticket>) => {
            const dataToSend: Partial<Ticket> = {
                titre: formData.titre,
                description: formData.description,
                sale_id: formData.sale_id,
            };
            if (id) {
                const response = await update<Ticket, Partial<Ticket>>('/ticket', Number(id), dataToSend);
                return response.data;
            } else {
                const response = await create<Ticket, Partial<Ticket>>('/ticket', dataToSend);
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
            navigate('/ticket');
        },
        onError: (err: any) => {
            const errorMessage =
                err.response?.data?.message || err.message || "Une erreur est survenue lors de l'enregistrement.";
            setMutationError(errorMessage);
            setIsSubmitting(false);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name as keyof Ticket]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleChangeSale = (event: SelectChangeEvent) => {
        const selectedSaleId = event.target.value === '' ? undefined : Number(event.target.value);
        setFormData({ ...formData, sale_id: selectedSaleId });

        if (errors.sale_id) {
            setErrors((prev) => ({ ...prev, sale_id: '' }));
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
            return <NotFoundPage message={`Ticket avec l'ID ${id} non trouvé`} />;
        }
        return errorContent;
    }

    return (
        <Box>
            <CustomMatButton
                variant="outlined"
                onClick={() => navigate('/ticket')}
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
                {id ? 'Modifier un ticket' : 'Ajouter un ticket'}
            </Typography>
            {mutationError && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {mutationError}
                </Typography>
            )}
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField
                    label="Titre *"
                    name="titre"
                    value={formData.titre || ''}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    error={!!errors.titre}
                    helperText={errors.titre || ''}
                />
                <TextField
                    label="Description *"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    multiline
                    rows={5}
                    error={!!errors.description}
                    helperText={errors.description || ''}
                />
                <FormControl>
                    <InputLabel id="user-select-label">Sale *</InputLabel>
                    <Select
                        labelId="user-select-label"
                        id="user-select"
                        value={String(formData.sale_id ?? '')}
                        onChange={handleChangeSale}
                        label="Sale *"
                        inputProps={{ 'data-testid': 'sale-select-input' }}
                    >
                        <MenuItem value="">
                            <em>Sélectionner une sale</em>
                        </MenuItem>
                        {sales &&
                            sales.map((sale) => (
                                <MenuItem key={sale.id} value={String(sale.id)}>
                                    {sale.titre}
                                </MenuItem>
                            ))}
                    </Select>
                    {errors.sale_id && (
                        <Typography color="error" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            {errors.sale_id}
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
                        onClick={() => navigate('/ticket')}
                        disabled={isSubmitting || mutation.isPending}
                    >
                        Annuler
                    </CustomMatButton>
                </Box>
            </Box>
        </Box>
    );
}