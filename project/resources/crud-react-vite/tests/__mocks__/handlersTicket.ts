import { http, HttpResponse } from 'msw';

interface TicketBody {
    titre: string;
    description: string;
    sale_id: number;
}

export const handlersTicket = [
    http.get('http://localhost:8741/api/ticket', () => {
        return HttpResponse.json([
            {
                id: 1,
                titre: 'ticket 1',
                description: 'description 1',
                sale_id: 1,
                sales: [{ id: 1, titre: 'sale 1' }],
            },
            {
                id: 2,
                titre: 'ticket 2',
                description: 'description 2',
                sale_id: 2,
                sales: [{ id: 2, titre: 'sale 2' }],
            },
        ]);
    }),
    http.get('http://localhost:8741/api/ticket/:id', ({ params }) => {
        return HttpResponse.json({
            id: Number(params.id),
            titre: `ticket ${params.id}`,
            description: `description ${params.id}`,
            sale_id: Number(params.id),
            sales: [{ id: Number(params.id), titre: `sale ${params.id}` }],
        });
    }),
    http.post('http://localhost:8741/api/ticket', async ({ request }) => {
        const body = (await request.json()) as TicketBody;
        return HttpResponse.json(
            {
                id: 3,
                titre: body.titre,
                description: body.description,
                sale_id: body.sale_id,
                sales: [{ id: body.sale_id, titre: `sale ${body.sale_id}` }],
            },
            { status: 201 }
        );
    }),
    http.put('http://localhost:8741/api/ticket/:id', async ({ request, params }) => {
        const body = (await request.json()) as TicketBody;
        return HttpResponse.json({
            id: Number(params.id),
            titre: body.titre,
            description: body.description,
            sale_id: body.sale_id,
            sales: [{ id: body.sale_id, titre: `sale ${body.sale_id}` }],
        });
    }),
    http.delete('http://localhost:8741/api/ticket/:id', ({ params }) => {
        return HttpResponse.json({}, { status: 204 });
    }),
    http.options('http://localhost:8741/api/ticket', () => {
        return new HttpResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }),
];