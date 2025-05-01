import {http, HttpResponse} from 'msw';

export const handlersService = [
    http.get('http://localhost:8741/api/config/jwt', () => {
        return HttpResponse.json({ jwt_enabled: true });
    }),

];