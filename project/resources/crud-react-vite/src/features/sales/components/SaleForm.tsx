import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getById, create, update, getAll } from '../../../services/apiService';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import NotFoundPage from '../../../pages/error/NotFoundPage.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';
import { Client } from '../../clients/types/client.types.ts';
import { Sale } from '../types/sale.types.ts';
import { Material } from '../../materials/types/material.types.ts';

interface SaleFormData {
    titre: string;
    description: string;
    customer_id: string;
    materials: Record<number, boolean>;
}

export default function SaleForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const initialFormData: SaleFormData = {
        titre: '',
        description: '',
        customer_id: '',
        materials: {},
    };
    const [formData, setFormData] = useState<SaleFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof Omit<SaleFormData, 'materials'>, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mutationError, setMutationError] = useState<string | null>(null);

    const { data: sale, error, isLoading } = useQuery({
        queryKey: ['sale', id],
        queryFn: async () => {
            if (id) {
                const response: AxiosResponse<Sale> = await getById<Sale>('/sale', Number(id));
                return response.data;
            }
            return null;
        },
        staleTime: 0,
        enabled: !!id,
    });

    const { data: clients, error: errorClients, isLoading: isLoadingClients } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const response: AxiosResponse<Client[]> = await getAll<Client>('/client');
            return response.data;
        },
        staleTime: 0,
    });

    const { data: materials, error: errorMaterials, isLoading: isLoadingMaterials } = useQuery({
        queryKey: ['materials'],
        queryFn: async () => {
            const response: AxiosResponse<Material[]> = await getAll<Material>('/material');
            return response.data;
        },
        staleTime: 0,
    });

    useEffect(() => {
        if (materials) {
            const initialMaterials: Record<number, boolean> = {};
            materials.forEach((material) => {
                initialMaterials[material.id] = false;
            });

            if (sale) {
                setFormData({
                    titre: sale.titre,
                    description: sale.description,
                    customer_id: String(sale.customer_id),
                    materials: {
                        ...initialMaterials,
                        ...Object.fromEntries(sale.materials.map((material) => [material.id, true])),
                    },
                });
            } else {
                setFormData((prev) => ({
                    ...prev,
                    materials: initialMaterials,
                }));
            }
        }
    }, [sale, materials]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Omit<SaleFormData, 'materials'>, string>> = {};

        if (!formData.titre || formData.titre.trim() === '') {
            newErrors.titre = 'Le titre est requis';
        }

        if (!formData.description || formData.description.trim() === '') {
            newErrors.description = 'La description est requise';
        }

        if (!formData.customer_id || formData.customer_id.trim() === '') {
            newErrors.customer_id = 'Le client est requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const mutation = useMutation({
        mutationFn: async (formData: SaleFormData) => {
            const selectedMaterials = Object.entries(formData.materials).reduce(
                (acc, [materialId, checked]) => {
                    acc[`material_${materialId}`] = checked;
                    return acc;
                },
                {} as Record<string, boolean>
            );

            const dataToSend = {
                titre: formData.titre,
                description: formData.description,
                customer_id: Number(formData.customer_id),
                ...selectedMaterials,
            };

            if (id) {
                const response = await update<Sale>('/sale', Number(id), dataToSend);
                return response.data;
            } else {
                const response = await create<Sale>('/sale', dataToSend);
                return response.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['sale', id] });
            }
            setIsSubmitting(false);
            setMutationError(null);
            navigate('/sale');
        },
        onError: (err: any) => {
            const errorMessage =
                err.response?.data?.message || err.message || "Une erreur est survenue lors de l'enregistrement.";
            setMutationError(errorMessage);
            setIsSubmitting(false);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name as keyof Omit<SaleFormData, 'materials'>]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleCustomerChange = (event: SelectChangeEvent) => {
        const selectedCustomerId = event.target.value as string;
        setFormData({ ...formData, customer_id: selectedCustomerId });

        if (errors.customer_id) {
            setErrors((prev) => ({ ...prev, customer_id: '' }));
        }
    };

    const handleMaterialChange = (materialId: number, checked: boolean) => {
        setFormData({
            ...formData,
            materials: {
                ...formData.materials,
                [materialId]: checked,
            },
        });
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            setMutationError(null);
            mutation.mutate(formData);
        }
    };

    const loadingSpinner = useLoadingSpinner({ isLoading: isLoading || isLoadingClients || isLoadingMaterials });
    const { content: errorContent, isServerError } = useApiError({ error: error || errorClients || errorMaterials });
    const mutationSpinner = useLoadingSpinner({ isLoading: isSubmitting || mutation.isPending });

    if (loadingSpinner || mutationSpinner) {
        return loadingSpinner || mutationSpinner;
    }

    if (errorContent) {
        if (!isServerError) {
            return <NotFoundPage message={`Sale avec l'ID ${id} non trouvé`} />;
        }
        return errorContent;
    }

    return (
        <Box>
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
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {id ? 'Modifier une sale' : 'Ajouter une sale'}
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
                    <InputLabel id="customer-select-label">Clients *</InputLabel>
                    <Select
                        labelId="customer-select-label"
                        id="customer-select"
                        value={formData.customer_id || ''}
                        onChange={handleCustomerChange}
                        label="Clients *"
                        inputProps={{ 'data-testid': 'customer-select-input' }}
                    >
                        <MenuItem value="">
                            <em>Sélectionner un client</em>
                        </MenuItem>
                        {clients &&
                            clients.map((client) => (
                                <MenuItem key={client.id} value={String(client.id)}>
                                    {client.surnom}
                                </MenuItem>
                            ))}
                    </Select>
                    {errors.customer_id && (
                        <Typography color="error" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            {errors.customer_id}
                        </Typography>
                    )}
                </FormControl>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <FormControl component="fieldset" variant="outlined">
                        <Typography variant="h6" component="legend" sx={{ fontSize: '1rem', mb: 1 }}>
                            Materials
                        </Typography>
                        <FormGroup row sx={{ gap: 2, flexWrap: 'wrap' }}>
                            {materials &&
                                materials.map((material) => (
                                    <FormControlLabel
                                        key={material.id}
                                        control={
                                            <Checkbox
                                                checked={formData.materials[material.id] || false}
                                                onChange={(e) => handleMaterialChange(material.id, e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={material.designation}
                                    />
                                ))}
                        </FormGroup>
                    </FormControl>
                </Box>
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
                        onClick={() => navigate('/sale')}
                        disabled={isSubmitting || mutation.isPending}
                    >
                        Annuler
                    </CustomMatButton>
                </Box>
            </Box>
        </Box>
    );
}