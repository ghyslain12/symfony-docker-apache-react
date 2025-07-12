<?php

namespace App\Tests\Controller\Api;

use App\Entity\Customer;
use App\Entity\Material;
use App\Entity\Sale;
use App\Entity\User;
use App\Repository\CustomerRepository;
use App\Repository\MaterialRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class SaleControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private UserRepository $userRepository;
    private CustomerRepository $customerRepository;
    private MaterialRepository $materialRepository;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->userRepository = static::getContainer()->get(UserRepository::class);
        $this->customerRepository = static::getContainer()->get(CustomerRepository::class);
        $this->materialRepository = static::getContainer()->get(MaterialRepository::class);
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');

        // Nettoyer les tables pour les tests
        $this->entityManager->createQuery('DELETE FROM App\Entity\Sale')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Customer')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Material')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();

        parent::setUp();

    }

    private function createTestUser(string $email = 'test@example.com', string $password = 'password'): User
    {
        $user = new User();
        $user->setName('Test User');
        $user->setEmail($email);
        $user->setPassword(password_hash($password, PASSWORD_BCRYPT));
        $user->setRoles(['ROLE_USER']);
        $user->setCreatedAt(new \DateTime());
        $user->setUpdatedAt(new \DateTime());
        $this->entityManager->persist($user);
        $this->entityManager->flush();
        return $user;
    }

    private function createTestCustomer(int $userId, string $surnom = 'TestCustomer'): Customer
    {
        $customer = new Customer();
        $customer->setSurnom($surnom);
        $customer->setUser($this->userRepository->find($userId));
        $customer->setCreatedAt(new \DateTime());
        $customer->setUpdatedAt(new \DateTime());
        $this->entityManager->persist($customer);
        $this->entityManager->flush();
        return $customer;
    }

    private function createTestMaterial(int $userId, string $designation = 'TestMaterial'): Material
    {
        $material = new Material();
        $material->setDesignation($designation);
        $material->setCreatedAt(new \DateTime());
        $material->setUpdatedAt(new \DateTime());
        $this->entityManager->persist($material);
        $this->entityManager->flush();
        return $material;
    }

    private function createTestSale(int $customerId, string $titre = 'TestSale', array $materialIds = []): Sale
    {
        $sale = new Sale();
        $sale->setTitre($titre);
        $sale->setDescription('Description de test');
        $sale->setCustomer($this->customerRepository->find($customerId));
        $sale->setCreatedAt(new \DateTime());
        $sale->setUpdatedAt(new \DateTime());
        foreach ($materialIds as $materialId) {
            $sale->addMaterial($this->materialRepository->find($materialId));
        }
        $this->entityManager->persist($sale);
        $this->entityManager->flush();
        return $sale;
    }

    public function testIndexUnauthenticated(): void
    {
        $this->client->request('GET', '/api/sale');
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testIndexAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', '/api/sale');
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }

    public function testShowUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $this->client->request('GET', "/api/sale/{$testSale->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testShowAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $this->client->loginUser($testUser);

        $this->client->request('GET', "/api/sale/{$testSale->getId()}");
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('titre', $responseData);
        $this->assertEquals('TestSale', $responseData['titre']);
    }

    public function testShowNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', '/api/sale/999');
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Sale non trouvé', $responseData['error']);
    }

    public function testCreateUnauthenticated(): void
    {
        $this->client->request(
            'POST',
            '/api/sale',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'NewSale', 'customer_id' => 1])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testCreateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testMaterial = $this->createTestMaterial($testUser->getId());
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/sale',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titre' => 'NewSale',
                'description' => 'Description',
                'customer_id' => $testCustomer->getId(),
                'materials' => [$testMaterial->getId()]
            ])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('titre', $responseData);
        $this->assertEquals('NewSale', $responseData['titre']);
        $this->assertArrayHasKey('materials', $responseData);
        $this->assertCount(1, $responseData['materials']);
    }

    public function testCreateWithInvalidData(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/sale',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'NewSale']) // customer_id manquant
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Titre, description et customer_id sont requis', $responseData['error']);
    }

    public function testCreateWithDuplicateTitre(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $this->createTestSale($testCustomer->getId(), 'DuplicateSale');
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/sale',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'DuplicateSale', 'customer_id' => $testCustomer->getId()])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Ce titre est déjà utilisé', $responseData['error']);
    }

    public function testUpdateUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $this->client->request(
            'PUT',
            "/api/sale/{$testSale->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'UpdatedSale'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testUpdateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testMaterial = $this->createTestMaterial($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $this->client->loginUser($testUser);

        $this->client->request(
            'PUT',
            "/api/sale/{$testSale->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titre' => 'UpdatedSale',
                'description' => 'Updated Description',
                'customer_id' => $testCustomer->getId(),
                'materials' => [$testMaterial->getId()]
            ])
        );
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('titre', $responseData);
        $this->assertEquals('UpdatedSale', $responseData['titre']);
        $this->assertArrayHasKey('materials', $responseData);
        $this->assertCount(1, $responseData['materials']);
    }

    public function testUpdateNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'PUT',
            '/api/sale/999',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'UpdatedSale'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Sale non trouvé', $responseData['error']);
    }

    public function testDeleteUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $this->client->request('DELETE', "/api/sale/{$testSale->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testDeleteAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $this->client->loginUser($testUser);

        $this->client->request('DELETE', "/api/sale/{$testSale->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }

    public function testDeleteNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('DELETE', '/api/sale/999');
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Sale non trouvé', $responseData['error']);
    }
}