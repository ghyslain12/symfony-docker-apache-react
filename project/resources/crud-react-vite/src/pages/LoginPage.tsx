import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Box, Card, CardHeader, CardContent, Typography, TextField, CircularProgress, Table, TableRow, TableCell, TableBody} from '@mui/material';
import { useLoadingSpinner } from '../hooks/useLoadingSpinner.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import CustomMatButton from '../components/CustomMatButton.tsx';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, logout } = useAuth();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await login(credentials);
            navigate('/home', { replace: true });
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Erreur lors de la connexion');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = () => {
        logout();
        navigate('/user/add');
    };

    const loadingSpinner = useLoadingSpinner({ isLoading });

    if (loadingSpinner) return loadingSpinner;

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px - 48px)'}}>
            <Card sx={{ maxWidth: 400, width: '100%', p: 2, boxShadow: 3 }}>
                <CardHeader title="Connexion" titleTypographyProps={{ variant: 'h5', textAlign: 'center' }} />
                <CardContent>
                    {error && (
                        <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>
                    )}
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Email *"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            variant="filled"
                            required
                            type="email"
                            error={!!error && credentials.email === ''}
                            helperText={error && credentials.email === '' ? "L'email est requis" : ''}
                        />
                        <TextField
                            label="Mot de passe *"
                            name="password"
                            type="password"
                            value={credentials.password}
                            onChange={handleChange}
                            variant="filled"
                            required
                            error={!!error && credentials.password === ''}
                            helperText={error && credentials.password === '' ? 'Le mot de passe est requis' : ''}
                        />
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <CustomMatButton variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
                                            Se connecter
                                        </CustomMatButton>
                                    </TableCell>
                                    <TableCell>
                                        <CustomMatButton variant="contained" color="primary" onClick={handleAddUser} disabled={isLoading}>
                                            Ajouter Utilisateur
                                        </CustomMatButton>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        {isLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <CircularProgress size={50} />
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}