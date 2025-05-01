import { http, HttpResponse } from 'msw';

interface UserBody {
    name: string;
    email: string;
    password?: string;
}

export const handlersUser = [
    http.get('http://localhost:8741/api/config/jwt', () => {
        return HttpResponse.json({ jwt_enabled: true });
    }),
    http.get('http://localhost:8741/api/utilisateur', () => {
        return HttpResponse.json([
            { id: 1, name: 'utilisateur 1', email: 'utilisateur1@gmail.com' },
            { id: 2, name: 'utilisateur 2', email: 'utilisateur2@gmail.com' },
        ]);
    }),
    http.get('http://localhost:8741/api/utilisateur/:id', ({ params }) => {
        return HttpResponse.json({
            id: Number(params.id),
            name: `utilisateur ${params.id}`,
            email: `utilisateur${params.id}@gmail.com`,
        });
    }),
    http.post('http://localhost:8741/api/utilisateur', async ({ request }) => {
        const body = (await request.json()) as UserBody;
        return HttpResponse.json({ id: 1, name: body.name, email: body.email });
    }),
    http.put('http://localhost:8741/api/utilisateur/:id', async ({ request, params }) => {
        const body = (await request.json()) as UserBody;
        return HttpResponse.json({ id: Number(params.id), name: body.name, email: body.email });
    }),
    http.delete('http://localhost:8741/api/utilisateur/:id', ({ params }) => {
        return new HttpResponse(null, { status: 204 });
    }),
    http.get('http://localhost:8741/api/hello', () => {
        return HttpResponse.json({ message: 'Hello, World!' }, { headers: { 'Content-Type': 'application/json' } });
    }),
    http.get('http://localhost:8741/api/hello-error', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500, headers: { 'Content-Type': 'application/json' } });
    }),
];