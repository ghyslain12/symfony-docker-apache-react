<?php

namespace App\Service;

use App\Entity\Material;
use App\Repository\MaterialRepository;
use Doctrine\ORM\EntityManagerInterface;

class MaterialService
{
    private MaterialRepository $materialRepository;

    public function __construct(MaterialRepository $materialRepository, EntityManagerInterface $entityManager)
    {
        $this->materialRepository = $materialRepository;
        $this->entityManager = $entityManager;
    }

    public function getAllMaterials(): array
    {
        return $this->materialRepository->findAll();
    }

    public function getMaterialById(int $id): ?Material
    {
        return $this->materialRepository->find($id);
    }

    public function getByDesignation(string $designation): ?Material
    {
        return $this->materialRepository->findByDesignation($designation);
    }

    public function createMaterial(string $designation): Material
    {
        $material = new Material();
        $material->setDesignation($designation);
        $material->setCreatedAt(new \DateTime());
        $material->setUpdatedAt(new \DateTime());

        $this->entityManager->persist($material);
        $this->entityManager->flush();

        return $material;
    }

    public function updateMaterial(int $id, ?string $designation): ?Material
    {
        $material = $this->materialRepository->find($id);
        if (!$material) {
            return null;
        }

        if ($designation !== null) {
            $material->setDesignation($designation);
        }

        $material->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();
        return $material;
    }

    public function deleteMaterial(int $id): bool
    {
        $material = $this->materialRepository->find($id);
        if (!$material) {
            return false;
        }

        $this->entityManager->remove($material);
        $this->entityManager->flush();
        return true;
    }
}