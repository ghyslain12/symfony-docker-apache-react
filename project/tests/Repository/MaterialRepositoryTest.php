<?php

namespace App\Tests\Repository;

use App\Entity\Customer;
use App\Entity\Material;
use App\Entity\User;
use App\Repository\MaterialRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class MaterialRepositoryTest extends KernelTestCase
{
    private MaterialRepository $materialRepository;
    private $entityManager;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()->get('doctrine')->getManager();
        $this->materialRepository = $this->entityManager->getRepository(Material::class);

        // Nettoyer la base
        $this->entityManager->createQuery('DELETE FROM App\Entity\Material')->execute();
    }

    public function testFindByDesignation(): void
    {
        $material = new Material();
        $material->setDesignation('Test Material');
        $this->entityManager->persist($material);
        $this->entityManager->flush();

        $foundMaterial = $this->materialRepository->findByDesignation('Test Material');
        $this->assertNotNull($foundMaterial);
        $this->assertEquals('Test Material', $foundMaterial->getDesignation());

        $notFoundMaterial = $this->materialRepository->findByDesignation('Non Existent');
        $this->assertNull($notFoundMaterial);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
    }
}