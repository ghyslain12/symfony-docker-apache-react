<?php

namespace App\Controller\Api;

use App\Service\SaleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/sale')]
class SaleController extends AbstractController
{
    private SaleService $saleService;
    private SerializerInterface $serializer;

    public function __construct(SaleService $saleService, SerializerInterface $serializer)
    {
        $this->saleService = $saleService;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'api_sale_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $sales = $this->saleService->getAllSales();

        $data = array_map(function ($sale) {
            return $sale->format();
        }, $sales);

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_sale_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $sale = $this->saleService->getSaleById($id);
        if (!$sale) {
            return $this->json(['error' => 'Sale non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($sale->format(), Response::HTTP_OK);
    }

    #[Route('', name: 'api_sale_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['titre'], $data['customer_id'])) {
            return $this->json(['error' => 'Titre, description et customer_id sont requis'], Response::HTTP_BAD_REQUEST);
        }

        if ($this->saleService->getByTitre($data['titre'])) {
            return $this->json(['error' => 'Ce titre est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        $materialIds = $data['materials'] ?? [];

        $sale = $this->saleService->createSale(
            $data['titre'],
            $data['description'],
            $data['customer_id'],
            $materialIds
        );
        if (!$sale) {
            return $this->json(['error' => 'Customer non trouvé'], Response::HTTP_BAD_REQUEST);
        }

        $json = $this->serializer->serialize($sale->format(), 'json', ['groups' => 'sale:read']);
        $saleData = json_decode($json, true);

        $saleData['materials'] = [];
        foreach ($sale->format()['materials'] as $material) {
            $saleData['materials'][] = $material;
        }

        return new JsonResponse($saleData, Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_sale_update', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $sale = $this->saleService->getSaleById($id);
        if (!$sale) {
            return $this->json(['error' => 'Sale non trouvé'], Response::HTTP_NOT_FOUND);
        }


        $data = json_decode($request->getContent(), true);
        $materialIds = $data['materials'] ?? [];
        $sale = $this->saleService->updateSale(
            $id,
            $data['titre'] ?? null,
            $data['description'] ?? null,
            $data['customer_id'] ?? null,
            $materialIds
        );
        if (!$sale) {
            return $this->json(['error' => 'Sale non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($sale, 'json', ['groups' => 'sale:read']);
        $saleData = json_decode($json, true);

        $saleData['materials'] = [];
        foreach ($sale->format()['materials'] as $material) {
            $saleData['materials'][] = $material;
        }
        return new JsonResponse($saleData, Response::HTTP_OK);
     }

    #[Route('/{id}', name: 'api_sale_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $sale = $this->saleService->getSaleById($id);
        if (!$sale) {
            return $this->json(['error' => 'Sale non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $this->saleService->deleteSale($id);
        return $this->json(['message' => 'Sale supprimé'], Response::HTTP_NO_CONTENT);
    }
}