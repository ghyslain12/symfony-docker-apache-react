import { http, HttpResponse } from 'msw';

export const handlersGeneral = [
    http.post('*/api/login', async ({ request }) => {
        const body = await request.json() as LoginCredentials;
        if (body.email === 'john@example.com' && body.password === 'password') {
            return HttpResponse.json({
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4iLCJleHAiOjk5OTk5OTk5OTl9.signature',
                user: { id: 1, name: 'John' },
            }, { status: 200 });
        }
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }),
];