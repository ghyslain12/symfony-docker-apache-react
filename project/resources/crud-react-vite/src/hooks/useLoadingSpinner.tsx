import { Box, CircularProgress, Typography } from '@mui/material';

interface UseLoadingSpinnerProps {
    isLoading: boolean;
}

export const useLoadingSpinner = ({ isLoading }: UseLoadingSpinnerProps) => {
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                }}
            >
                <CircularProgress size={60} thickness={4} sx={{color: '#1976d2', animationDuration: '800ms'}} />
                <Typography sx={{ mt: 2, color: '#1976d2', fontSize: '14px', fontWeight: '500' }}>
                    Chargement...
                </Typography>
            </Box>
        );
    }
    return null;
};