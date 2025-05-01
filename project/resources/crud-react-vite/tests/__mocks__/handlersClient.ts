import { http, HttpResponse } from 'msw';

interface ClientBody {
    surnom: string;
    user_id: number;
}

export const handlersClient = [
    http.get('http://localhost:8741/api/client', () => {
        return HttpResponse.json([
            { id: 1, surnom: 'client 1', user_id: 1, user: { id: 1, name: 'utilisateur 1' } },
            { id: 2, surnom: 'client 2', user_id: 2, user: { id: 2, name: 'utilisateur 2' } },
        ]);
    }),
    http.get('http://localhost:8741/api/client/:id', ({ params }) => {
        return HttpResponse.json({
            id: Number(params.id),
            surnom: `client ${params.id}`,
            user_id: Number(params.id),
            user: { id: Number(params.id), name: `utilisateur ${params.id}` },
        });
    }),
    http.get('http://localhost:8741/api/utilisateur', () => {
        return HttpResponse.json([
            { id: 1, name: 'utilisateur 1' },
            { id: 2, name: 'utilisateur 2' },
        ]);
    }),
    http.post('http://localhost:8741/api/client', async ({ request }) => {
        const body = (await request.json()) as ClientBody;
        return HttpResponse.json({ id: 1, surnom: body.surnom, user_id: body.user_id });
    }),
    http.options('http://localhost:8741/api/client', () => {
        return new HttpResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }),
    http.options('http://localhost:8741/api/utilisateur', () => {
        return new HttpResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }),
    http.put('http://localhost:8741/api/client/:id', async ({ request, params }) => {
        const body = (await request.json()) as ClientBody;
        return HttpResponse.json({ id: Number(params.id), surnom: body.surnom, user_id: body.user_id });
    }),
    http.delete('http://localhost:8741/api/client/:id', ({ params }) => {
        return new HttpResponse(null, { status: 204 });
    }),
];