<?php

namespace App\Tests\Repository;

use App\Entity\Customer;
use App\Entity\Sale;
use App\Entity\User;
use App\Repository\SaleRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class SaleRepositoryTest extends KernelTestCase
{
    private SaleRepository $saleRepository;
    private $entityManager;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()->get('doctrine')->getManager();
        $this->saleRepository = $this->entityManager->getRepository(Sale::class);

        // Nettoyer la base
        $this->entityManager->createQuery('DELETE FROM App\Entity\Sale')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Customer')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();
    }

    private function createTestUser(): User
    {
        $user = new User();
        $user->setName('Test User');
        $user->setEmail('test@example.com');
        $user->setPassword('hashed_password');
        $user->setRoles(['ROLE_USER']);
        $user->setCreatedAt(new \DateTime());
        $user->setUpdatedAt(new \DateTime());
        $this->entityManager->persist($user);
        $this->entityManager->flush();
        return $user;
    }

    private function createTestCustomer(User $user): Customer
    {
        $customer = new Customer();
        $customer->setSurnom('TestCustomer');
        $customer->setUser($user);
        $customer->setCreatedAt(new \DateTime());
        $customer->setUpdatedAt(new \DateTime());
        $this->entityManager->persist($customer);
        $this->entityManager->flush();
        return $customer;
    }

    public function testFindByTitre(): void
    {
        $user = $this->createTestUser();
        $customer = $this->createTestCustomer($user);

        $sale = new Sale();
        $sale->setTitre('Test Sale');
        $sale->setDescription('Test Description');
        $sale->setCustomer($customer);
        $this->entityManager->persist($sale);
        $this->entityManager->flush();

        $foundSale = $this->saleRepository->findByTitre('Test Sale');
        $this->assertNotNull($foundSale);
        $this->assertEquals('Test Sale', $foundSale->getTitre());

        $notFoundSale = $this->saleRepository->findByTitre('Non Existent');
        $this->assertNull($notFoundSale);
    }

    public function testFindByCustomerId(): void
    {
        $user = $this->createTestUser();
        $customer = $this->createTestCustomer($user);

        $sale1 = new Sale();
        $sale1->setTitre('Sale 1');
        $sale1->setDescription('Desc 1');
        $sale1->setCustomer($customer);
        $this->entityManager->persist($sale1);

        $sale2 = new Sale();
        $sale2->setTitre('Sale 2');
        $sale2->setDescription('Desc 2');
        $sale2->setCustomer($customer);
        $this->entityManager->persist($sale2);

        $this->entityManager->flush();

        $sales = $this->saleRepository->findByCustomerId($customer->getId());
        $this->assertCount(2, $sales);
        $this->assertEquals('Sale 1', $sales[0]->getTitre());
        $this->assertEquals('Sale 2', $sales[1]->getTitre());

        $noSales = $this->saleRepository->findByCustomerId(999);
        $this->assertEmpty($noSales);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
    }
}