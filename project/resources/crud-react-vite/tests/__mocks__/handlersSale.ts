import { http, HttpResponse } from 'msw';

interface SaleBody {
    titre: string;
    description: string;
    customer_id: number;
    [key: string]: any;
}

export const handlersSale = [
    http.get('http://localhost:8741/api/sale', () => {
        return HttpResponse.json([
            {
                id: 1,
                titre: 'sale 1',
                description: 'description 1',
                customer_id: 1,
                customer: { id: 1, surnom: 'client 1' },
                materials: [{ id: 1, designation: 'material 1' }],
            },
            {
                id: 2,
                titre: 'sale 2',
                description: 'description 2',
                customer_id: 2,
                customer: { id: 2, surnom: 'client 2' },
                materials: [{ id: 2, designation: 'material 2' }],
            },
        ]);
    }),
    http.get('http://localhost:8741/api/sale/:id', ({ params }) => {
        return HttpResponse.json({
            id: Number(params.id),
            titre: `sale ${params.id}`,
            description: `description ${params.id}`,
            customer_id: Number(params.id),
            customer: { id: Number(params.id), surnom: `client ${params.id}` },
            materials: [{ id: 1, designation: 'material 1' }],
        });
    }),
    http.post('http://localhost:8741/api/sale', async ({ request }) => {
        const body = (await request.json()) as SaleBody;
        const selectedMaterials = Object.entries(body)
            .filter(([key, value]) => key.startsWith('material_') && value === true)
            .map(([key]) => {
                const materialId = Number(key.split('_')[1]);
                return { id: materialId, designation: `material ${materialId}` };
            });
        return HttpResponse.json(
            {
                id: 3,
                titre: body.titre,
                description: body.description,
                customer_id: body.customer_id,
                customer: { id: body.customer_id, surnom: `client ${body.customer_id}` },
                materials: selectedMaterials,
            },
            { status: 201 }
        );
    }),
    http.put('http://localhost:8741/api/sale/:id', async ({ request, params }) => {
        const body = (await request.json()) as SaleBody;
        const selectedMaterials = Object.entries(body)
            .filter(([key, value]) => key.startsWith('material_') && value === true)
            .map(([key]) => {
                const materialId = Number(key.split('_')[1]);
                return { id: materialId, designation: `material ${materialId}` };
            });
        return HttpResponse.json({
            id: Number(params.id),
            titre: body.titre,
            description: body.description,
            customer_id: body.customer_id,
            customer: { id: body.customer_id, surnom: `client ${body.customer_id}` },
            materials: selectedMaterials,
        });
    }),
    http.delete('http://localhost:8741/api/sale/:id', ({ params }) => {
        return HttpResponse.json({}, { status: 204 });
    }),
    http.options('http://localhost:8741/api/sale', () => {
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