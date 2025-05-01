<?php

namespace App\Controller\Api;

use App\Service\MaterialService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/material')]
class MaterialController extends AbstractController
{
    private MaterialService $materialService;
    private SerializerInterface $serializer;

    public function __construct(MaterialService $materialService, SerializerInterface $serializer)
    {
        $this->materialService = $materialService;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'api_material_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $materials = $this->materialService->getAllMaterials();
        $data = $this->serializer->serialize($materials, 'json', ['groups' => 'material:read']);
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_material_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $material = $this->materialService->getMaterialById($id);
        if (!$material) {
            return $this->json(['error' => 'Material non trouvé'], Response::HTTP_NOT_FOUND);
        }
        $data = $this->serializer->serialize($material, 'json', ['groups' => 'material:read']);
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'api_material_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['designation'])) {
            return $this->json(['error' => 'Designation est requis'], Response::HTTP_BAD_REQUEST);
        }

        if ($this->materialService->getByDesignation($data['designation'])) {
            return $this->json(['error' => 'Cette designation est déjà utilisée'], Response::HTTP_CONFLICT);
        }

        $material = $this->materialService->createMaterial($data['designation']);
        $json = $this->serializer->serialize($material, 'json', ['groups' => 'material:read']);
        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'api_material_update', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $material = $this->materialService->getMaterialById($id);
        if (!$material) {
            return $this->json(['error' => 'Material non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $material = $this->materialService->updateMaterial(
            $id,
            $data['designation'] ?? null
        );
        $data = $this->serializer->serialize($material, 'json', ['groups' => 'material:read']);
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_material_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $material = $this->materialService->getMaterialById($id);
        if (!$material) {
            return $this->json(['error' => 'Material non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $this->materialService->deleteMaterial($id);
        return $this->json(['message' => 'Material supprimé'], Response::HTTP_NO_CONTENT);
    }

    #[Route('/ping', name: 'api_material_ping', methods: ['GET'])]
    public function ping(): JsonResponse
    {
        $data = $this->serializer->serialize([
            'status' => 'success',
            'message' => 'ping',
            'timestamp' => new \DateTime()
        ], 'json');

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }
}