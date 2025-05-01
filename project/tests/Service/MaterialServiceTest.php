<?php

namespace App\Tests\Service;

use App\Entity\Material;
use App\Repository\MaterialRepository;
use App\Service\MaterialService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class MaterialServiceTest extends TestCase
{
    private MaterialService $materialService;
    private MockObject $entityManager;
    private MockObject $materialRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->materialRepository = $this->createMock(MaterialRepository::class);

        $this->materialService = new MaterialService(
            $this->materialRepository,
            $this->entityManager
        );
    }

    public function testGetAllMaterials(): void
    {
        $materials = [new Material(), new Material()];
        $this->materialRepository->expects($this->once())
            ->method('findAll')
            ->willReturn($materials);

        $result = $this->materialService->getAllMaterials();
        $this->assertSame($materials, $result);
        $this->assertCount(2, $result);
    }

    public function testGetMaterialById(): void
    {
        $material = new Material();
        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($material);

        $result = $this->materialService->getMaterialById(1);
        $this->assertSame($material, $result);
    }

    public function testGetMaterialByIdNotFound(): void
    {
        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $result = $this->materialService->getMaterialById(999);
        $this->assertNull($result);
    }

    public function testGetByDesignation(): void
    {
        $material = new Material();
        $this->materialRepository->expects($this->once())
            ->method('findByDesignation')
            ->with('TestMaterial')
            ->willReturn($material);

        $result = $this->materialService->getByDesignation('TestMaterial');
        $this->assertSame($material, $result);
    }

    public function testCreateMaterial(): void
    {
        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($this->callback(function ($material) {
                return $material instanceof Material &&
                    $material->getDesignation() === 'NewMaterial' &&
                    $material->getCreatedAt() instanceof \DateTimeInterface &&
                    $material->getUpdatedAt() instanceof \DateTimeInterface;
            }));

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->materialService->createMaterial('NewMaterial');
        $this->assertInstanceOf(Material::class, $result);
        $this->assertEquals('NewMaterial', $result->getDesignation());
        $this->assertInstanceOf(\DateTimeInterface::class, $result->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $result->getUpdatedAt());
    }

    public function testUpdateMaterialSuccess(): void
    {
        $material = new Material();
        $material->setDesignation('OldMaterial');

        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($material);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->materialService->updateMaterial(1, 'UpdatedMaterial');
        $this->assertSame($material, $result);
        $this->assertEquals('UpdatedMaterial', $material->getDesignation());
        $this->assertInstanceOf(\DateTimeInterface::class, $material->getUpdatedAt());
    }

    public function testUpdateMaterialNoChange(): void
    {
        $material = new Material();
        $material->setDesignation('OldMaterial');
        $originalUpdatedAt = $material->getUpdatedAt();

        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($material);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->materialService->updateMaterial(1, null);
        $this->assertSame($material, $result);
        $this->assertEquals('OldMaterial', $material->getDesignation()); // Pas de changement
        $this->assertNotSame($originalUpdatedAt, $material->getUpdatedAt()); // UpdatedAt modifié
    }

    public function testUpdateMaterialNotFound(): void
    {
        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->materialService->updateMaterial(999, 'UpdatedMaterial');
        $this->assertNull($result);
    }

    public function testDeleteMaterialSuccess(): void
    {
        $material = new Material();
        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($material);

        $this->entityManager->expects($this->once())
            ->method('remove')
            ->with($material);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->materialService->deleteMaterial(1);
        $this->assertTrue($result);
    }

    public function testDeleteMaterialNotFound(): void
    {
        $this->materialRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('remove');

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->materialService->deleteMaterial(999);
        $this->assertFalse($result);
    }
}