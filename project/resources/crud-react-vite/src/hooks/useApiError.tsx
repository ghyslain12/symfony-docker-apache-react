import { AxiosError } from 'axios';
import ServerErrorPage from '../pages/error/ServerErrorPage.tsx';
import { ErrorResponseData } from '../types/ErrorResponseData.tsx';

interface UseApiErrorProps {
    error: unknown;
}

export const useApiError = ({ error }: UseApiErrorProps) => {
    if (error) {
        const axiosError = error as AxiosError<ErrorResponseData>;
        const status = axiosError.response?.status;

        // Erreur serveur (5xx)
        if (status && status >= 500) {
            return {
                content: (
                    <ServerErrorPage
                        message={`Erreur serveur: ${axiosError.response?.data?.message || axiosError.message}`}
                    />
                ),
                isServerError: true,
            };
        }

        // Erreur générique (par exemple, réseau)
        return {
            content: (
                <ServerErrorPage message={`Erreur: ${axiosError.message}`} />
            ),
            isServerError: false,
        };
    }

    return {
        content: null,
        isServerError: false,
    };
};