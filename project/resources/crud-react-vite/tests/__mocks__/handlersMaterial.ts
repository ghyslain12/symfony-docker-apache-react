import { http, HttpResponse } from 'msw';

interface MaterialBody {
    designation: string;
}

export const handlersMaterial = [
    http.get('http://localhost:8741/api/material', () => {
        return HttpResponse.json([
            { id: 1, designation: 'material 1' },
            { id: 2, designation: 'material 2' },
        ]);
    }),
    http.get('http://localhost:8741/api/material/:id', ({ params }) => {
        return HttpResponse.json({
            id: Number(params.id),
            designation: `material ${params.id}`,
        });
    }),
    http.post('http://localhost:8741/api/material', async ({ request }) => {
        const body = (await request.json()) as MaterialBody;
        return HttpResponse.json({ id: 1, designation: body.designation });
    }),
    http.put('http://localhost:8741/api/material/:id', async ({ request, params }) => {
        const body = (await request.json()) as MaterialBody;
        return HttpResponse.json({ id: Number(params.id), designation: body.designation });
    }),
    http.delete('http://localhost:8741/api/material/:id', ({ params }) => {
        return new HttpResponse(null, { status: 204 });
    }),
];