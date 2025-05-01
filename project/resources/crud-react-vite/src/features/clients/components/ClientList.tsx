import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Pagination, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAll, deleteObj } from '../../../services/apiService';
import { Client } from '../types/client.types.ts';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';

export default function ClientList() {
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: objects = [], error, isLoading, isFetching } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const response: AxiosResponse<Client[]> = await getAll<Client>('/client');
            return response.data ?? [];
        },
        staleTime: 0,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteObj('/client', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setIsDeleting(false);
        },
        onError: () => {
            setIsDeleting(false);
        },
    });

    const loadingSpinner = useLoadingSpinner({ isLoading: isFetching });
    const mutationSpinner = useLoadingSpinner({ isLoading: isDeleting || deleteMutation.isPending });

    const { content: errorContent } = useApiError({ error });

    if (loadingSpinner || mutationSpinner) {
        return loadingSpinner || mutationSpinner;
    }

    if (errorContent) {
        return errorContent;
    }

    if (error) {
        return (
            <Box>
                <Typography color="error">
                    Erreur lors du chargement des clients : {error.message}
                </Typography>
            </Box>
        );
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet client ?')) {
            setIsDeleting(true);
            deleteMutation.mutate(id);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
        setPage(1);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
        setItemsPerPage(event.target.value as number);
        setPage(1);
    };

    const handleView = (id: number) => {
        navigate(`/client/view/${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`/client/edit/${id}`);
    };

    const handleAdd = () => {
        navigate('/client/add');
    };

    const filteredClients = Array.isArray(objects)
        ? objects.filter(
            (obj) => (obj.surnom ?? '').toLowerCase().includes(filter.toLowerCase())
        )
        : [];

    const paginatedClients = filteredClients.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Liste des clients</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField label="Filtrer" value={filter} onChange={handleFilterChange} variant="filled" size="small" sx={{ width: 200 }} />
                <CustomMatButton variant="contained" onClick={handleAdd}>Ajouter client</CustomMatButton>
            </Box>
            {filteredClients.length === 0 ? (
                <Typography>Aucun client trouvé.</Typography>
            ) : (
                <>
                    <TableContainer component={Paper} elevation={8}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Surnom</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedClients.map((obj) => (
                                    <TableRow key={obj.id}>
                                        <TableCell>{obj.id}</TableCell>
                                        <TableCell>{obj.surnom ?? 'N/A'}</TableCell>
                                        <TableCell>{obj.user?.name ?? 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleView(obj.id)} color="primary" size="medium"
                                                    sx={{ mr: 1, color: 'black', fontWeight: '430', textTransform: 'none' }}>
                                                Voir
                                            </Button>
                                            <Button onClick={() => handleEdit(obj.id)} color="primary" size="medium"
                                                    sx={{ mr: 1, color: 'black', fontWeight: '430', textTransform: 'none' }}>
                                                Modifier
                                            </Button>
                                            <Button onClick={() => handleDelete(obj.id)} color="error" size="medium" disabled={deleteMutation.isPending}
                                                    sx={{ mr: 1, color: 'red', fontWeight: '430', textTransform: 'none' }}>
                                                Supprimer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <FormControl variant="outlined" size="small">
                            <InputLabel>Items par page</InputLabel>
                            <Select value={itemsPerPage} onChange={handleItemsPerPageChange} label="Items par page">
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                            </Select>
                        </FormControl>
                        <Pagination count={Math.ceil(filteredClients.length / itemsPerPage)} page={page} onChange={handlePageChange} size="small" />
                        <Typography variant="body2">1 - {paginatedClients.length} sur {filteredClients.length}</Typography>
                    </Box>
                </>
            )}
        </Box>
    );
}