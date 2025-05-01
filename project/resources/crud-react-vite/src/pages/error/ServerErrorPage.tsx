import {Box, Button, Typography} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ServerErrorPage({ message = 'Erreur serveur' }: { message?: string }) {
    const navigate = useNavigate();

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                Erreur serveur
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
                {message}
            </Typography>
            <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                    marginTop: 2,
                    textTransform: 'none',
                    backgroundColor: '#3f51b5',
                    color: 'white',
                    '&:hover': { backgroundColor: '#4758b8' },
                }}
            >
                Retour
            </Button>
        </Box>
    );
}