<?php

namespace App\Tests\Service;

use App\Entity\Customer;
use App\Entity\Material;
use App\Entity\Sale;
use App\Repository\CustomerRepository;
use App\Repository\MaterialRepository;
use App\Repository\SaleRepository;
use App\Service\SaleService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SaleServiceTest extends TestCase
{
    private SaleService $saleService;
    private MockObject $entityManager;
    private MockObject $saleRepository;
    private MockObject $customerRepository;
    private MockObject $materialRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->saleRepository = $this->createMock(SaleRepository::class);
        $this->customerRepository = $this->createMock(CustomerRepository::class);
        $this->materialRepository = $this->createMock(MaterialRepository::class);

        $this->saleService = new SaleService(
            $this->saleRepository,
            $this->customerRepository,
            $this->materialRepository,
            $this->entityManager
        );
    }

    public function testGetAllSales(): void
    {
        $sales = [new Sale(), new Sale()];
        $this->saleRepository->expects($this->once())
            ->method('findAll')
            ->willReturn($sales);

        $result = $this->saleService->getAllSales();
        $this->assertSame($sales, $result);
    }

    public function testGetSaleById(): void
    {
        $sale = new Sale();
        $this->saleRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($sale);

        $result = $this->saleService->getSaleById(1);
        $this->assertSame($sale, $result);
    }

    public function testGetByTitre(): void
    {
        $sale = new Sale();
        $this->saleRepository->expects($this->once())
            ->method('findByTitre')
            ->with('Test Sale')
            ->willReturn($sale);

        $result = $this->saleService->getByTitre('Test Sale');
        $this->assertSame($sale, $result);
    }

    public function testCreateSaleSuccess(): void
    {
        $customer = new Customer();
        $material = new Material();
        $sale = new Sale();

        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($customer);

        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(2)
            ->willReturn($material);

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($this->callback(function ($entity) use ($sale) {
                $sale->setTitre('New Sale');
                $sale->setDescription('Desc');
                $sale->setCustomer(new Customer());
                $sale->addMaterial(new Material());
                $sale->setCreatedAt($entity->getCreatedAt());
                $sale->setUpdatedAt($entity->getUpdatedAt());
                return $entity instanceof Sale &&
                    $entity->getTitre() === 'New Sale' &&
                    $entity->getDescription() === 'Desc' &&
                    $entity->getCustomer() !== null &&
                    $entity->getMaterials()->count() === 1;
            }));

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->saleService->createSale('New Sale', 'Desc', 1, [2]);
        $this->assertInstanceOf(Sale::class, $result);
    }

    public function testCreateSaleCustomerNotFound(): void
    {
        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('persist');

        $result = $this->saleService->createSale('New Sale', 'Desc', 999, []);
        $this->assertNull($result);
    }

    public function testUpdateSaleSuccess(): void
    {
        $sale = new Sale();
        $sale->setTitre('Old Sale');
        $sale->setDescription('Old Desc');
        $customer = new Customer();
        $material = new Material();

        $this->saleRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($sale);

        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(2)
            ->willReturn($customer);

        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(3)
            ->willReturn($material);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->saleService->updateSale(1, 'Updated Sale', 'Updated Desc', 2, [3]);
        $this->assertSame($sale, $result);
        $this->assertEquals('Updated Sale', $sale->getTitre());
        $this->assertEquals('Updated Desc', $sale->getDescription());
        $this->assertSame($customer, $sale->getCustomer());
        $this->assertCount(1, $sale->getMaterials());
        $this->assertTrue($sale->getMaterials()->contains($material));
    }

    public function testUpdateSaleNotFound(): void
    {
        $this->saleRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->saleService->updateSale(999, 'Updated Sale', null, null, []);
        $this->assertNull($result);
    }

    public function testDeleteSaleSuccess(): void
    {
        $sale = new Sale();
        $this->saleRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($sale);

        $this->entityManager->expects($this->once())
            ->method('remove')
            ->with($sale);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->saleService->deleteSale(1);
        $this->assertTrue($result);
    }

    public function testDeleteSaleNotFound(): void
    {
        $this->saleRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('remove');

        $result = $this->saleService->deleteSale(999);
        $this->assertFalse($result);
    }
}