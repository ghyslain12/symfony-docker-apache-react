<?php

namespace App\Tests\Repository;

use App\Entity\Customer;
use App\Entity\User;
use App\Repository\CustomerRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class CustomerRepositoryTest extends KernelTestCase
{
    private CustomerRepository $customerRepository;
    private $entityManager;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()->get('doctrine')->getManager();
        $this->customerRepository = $this->entityManager->getRepository(Customer::class);

        // Nettoyer la base
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

    public function testFindByTitre(): void
    {
        $user = $this->createTestUser();

        $customer = new Customer();
        $customer->setSurnom('Test Customer');
        $customer->setUser($user);
        $this->entityManager->persist($customer);
        $this->entityManager->flush();

        $foundCustomer = $this->customerRepository->findBySurnom('Test Customer');
        $this->assertNotNull($foundCustomer);
        $this->assertEquals('Test Customer', $foundCustomer->getSurnom());

        $notFoundCustomer = $this->customerRepository->findBySurnom('Non Existent');
        $this->assertNull($notFoundCustomer);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
    }
}