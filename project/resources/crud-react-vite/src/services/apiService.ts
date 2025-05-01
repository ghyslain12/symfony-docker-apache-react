import axios, { AxiosResponse, AxiosError } from 'axios';

// Interface pour typage sécurisé de error.response.data
interface ErrorResponseData {
    message?: string;
}

export const getAuthConfig = () => {
    return {
        jwtEnabled: true as boolean | undefined,
        token: localStorage.getItem('token'),
    };
};

const apiService = axios.create({
    baseURL: 'http://localhost:8741/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiService.interceptors.request.use(
    (config) => {
        const { jwtEnabled, token } = getAuthConfig();
        if (jwtEnabled === undefined) {
            throw new axios.Cancel('JWT_ENABLED non chargé');
        }
        if (!config.url?.endsWith('/config/jwt') && token && jwtEnabled) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiService.interceptors.response.use(
    (response: AxiosResponse) => {
        const contentType = response.headers['content-type'];
        if (contentType && !contentType.includes('application/json')) {
            return Promise.reject(new Error("La réponse du serveur n'est pas au format JSON"));
        }
        return response;
    },
    (error: AxiosError<ErrorResponseData>) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(new Error(`Erreur HTTP 401: ${error.response.data?.message || error.message}`));
        }
        if (error.config?.url?.endsWith('/config/jwt')) {
            return Promise.reject(new Error(`Erreur HTTP ${error.response?.status}: ${error.response?.data?.message || error.message}`));
        }
        if (!error.response) {
            return Promise.reject(new Error('Erreur réseau ou serveur indisponible'));
        }
        return Promise.reject(error);
    }
);

export const getAll = async <T>(url: string): Promise<AxiosResponse<T[]>> => {
    return await apiService.get(url);
};

export const getConfig = async <T>(url: string): Promise<AxiosResponse<T>> => {
    return await apiService.get(url);
};

export const getById = async <T>(url: string, id: number): Promise<AxiosResponse<T>> => {
    return await apiService.get(`${url}/${id}`);
};

export const create = async <T, D = Partial<T>>(url: string, data: D): Promise<AxiosResponse<T>> => {
    return await apiService.post(url, data);
};

export const update = async <T, D = Partial<T>>(url: string, id: number, data: D): Promise<AxiosResponse<T>> => {
    return await apiService.put(`${url}/${id}`, data);
};

export const deleteObj = async (url: string, id: number): Promise<AxiosResponse<void>> => {
    return await apiService.delete(`${url}/${id}`);
};

export default apiService;