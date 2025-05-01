import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Pagination, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAll, deleteObj } from '../../../services/apiService';
import { User } from '../types/user.types';
import CustomMatButton from '../../../components/CustomMatButton.tsx';
import { AxiosResponse } from 'axios';
import { useLoadingSpinner } from '../../../hooks/useLoadingSpinner.tsx';
import { useApiError } from '../../../hooks/useApiError.tsx';


export default function UserList() {
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: objects = [], error, isLoading, isFetching } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response: AxiosResponse<User[]> = await getAll<User>('/utilisateur');
            return response.data ?? [];
        },
        staleTime: 0,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteObj('/utilisateur', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
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
                    Erreur lors du chargement des utilisateurs : {error.message}
                </Typography>
            </Box>
        );
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
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
        navigate(`/user/view/${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`/user/edit/${id}`);
    };

    const handleAdd = () => {
        navigate('/user/add');
    };

    const filteredUsers = Array.isArray(objects)
        ? objects.filter(
            (obj) =>
                (obj.name ?? '').toLowerCase().includes(filter.toLowerCase()) ||
                (obj.email ?? '').toLowerCase().includes(filter.toLowerCase())
        )
        : [];

    const paginatedUsers = filteredUsers.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Liste des utilisateurs
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Filtrer"
                    value={filter}
                    onChange={handleFilterChange}
                    variant="filled"
                    size="small"
                    sx={{ width: 200 }}
                />
                <CustomMatButton variant="contained" onClick={handleAdd}>
                    Ajouter utilisateur
                </CustomMatButton>
            </Box>
            {filteredUsers.length === 0 ? (
                <Typography>Aucun utilisateur trouvé.</Typography>
            ) : (
                <Box>
                    <TableContainer component={Paper} elevation={8}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Nom</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedUsers.map((obj) => (
                                    <TableRow key={obj.id}>
                                        <TableCell>{obj.id}</TableCell>
                                        <TableCell>{obj.name ?? 'N/A'}</TableCell>
                                        <TableCell>{obj.email ?? 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() => handleView(obj.id)}
                                                color="primary"
                                                size="medium"
                                                sx={{ mr: 1, color: 'black', fontWeight: '430', textTransform: 'none' }}
                                            >
                                                Voir
                                            </Button>
                                            <Button
                                                onClick={() => handleEdit(obj.id)}
                                                color="primary"
                                                size="medium"
                                                sx={{ mr: 1, color: 'black', fontWeight: '430', textTransform: 'none' }}
                                            >
                                                Modifier
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(obj.id)}
                                                color="error"
                                                size="medium"
                                                disabled={deleteMutation.isPending}
                                                sx={{ mr: 1, color: 'red', fontWeight: '430', textTransform: 'none' }}
                                            >
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
                            <Select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                label="Items par page"
                            >
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                            </Select>
                        </FormControl>
                        <Pagination
                            count={Math.ceil(filteredUsers.length / itemsPerPage)}
                            page={page}
                            onChange={handlePageChange}
                            size="small"
                        />
                        <Typography variant="body2">
                            1 - {paginatedUsers.length} sur {filteredUsers.length}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}