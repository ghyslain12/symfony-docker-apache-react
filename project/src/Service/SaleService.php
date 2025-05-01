<?php

namespace App\Service;

use App\Entity\Sale;
use App\Repository\MaterialRepository;
use App\Repository\SaleRepository;
use App\Repository\CustomerRepository;
use Doctrine\ORM\EntityManagerInterface;

class SaleService
{
    private EntityManagerInterface $entityManager;
    private SaleRepository $saleRepository;
    private CustomerRepository $customerRepository;
    private MaterialRepository $materialRepository;

    public function __construct(SaleRepository $saleRepository, CustomerRepository $customerRepository, MaterialRepository $materialRepository, EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
        $this->saleRepository = $saleRepository;
        $this->customerRepository = $customerRepository;
        $this->materialRepository = $materialRepository;
    }

    public function getAllSales(): array
    {
        return $this->saleRepository->findAll();
    }

    public function getSaleById(int $id): ?Sale
    {
        return $this->saleRepository->find($id);
    }

    public function getByTitre(string $titre): ?Sale
    {
        return $this->saleRepository->findByTitre($titre);
    }

    public function createSale(string $titre, string $description, int $customerId, array $materialIds = []): ?Sale
    {
        $customer = $this->customerRepository->find($customerId);
        if (!$customer) {
            return null;
        }
        $sale = new Sale();
        $sale->setTitre($titre);
        $sale->setDescription($description);
        $sale->setCustomer($customer);
        foreach ($materialIds as $materialId) {
            $material = $this->materialRepository->find($materialId);
            if ($material) {
                $sale->addMaterial($material);
            }
        }
        $sale->setCreatedAt(new \DateTime());
        $sale->setUpdatedAt(new \DateTime());

        $this->entityManager->persist($sale);
        $this->entityManager->flush();

        return $sale;
    }

    public function updateSale(int $id, ?string $titre, ?string $description, ?int $customerId, ?array $materialIds = []): ?Sale
    {
        $sale = $this->saleRepository->find($id);
        if (!$sale) {
            return null;
        }

        if ($titre !== null) {
            $sale->setTitre($titre);
        }

        if ($description !== null) {
            $sale->setDescription($description);
        }

        if ($customerId !== null) {
            $customer = $this->customerRepository->find($customerId);
            if ($customer) {
                $sale->setCustomer($customer);
            }
        }

        if ($materialIds !== null) {
            foreach ($sale->getMaterials() as $material) {
                $sale->removeMaterial($material);
            }
            foreach ($materialIds as $materialId) {
                $material = $this->materialRepository->find($materialId);
                if ($material) {
                    $sale->addMaterial($material);
                }
            }
        }

        $sale->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();
        return $sale;
    }

    public function deleteSale(int $id): bool
    {
        $sale = $this->saleRepository->find($id);
        if (!$sale) {
            return false;
        }

        $this->entityManager->remove($sale);
        $this->entityManager->flush();
        return true;
    }
}