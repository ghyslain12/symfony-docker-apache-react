<?php

namespace App\Tests\Controller\Api;

use App\Entity\Customer;
use App\Entity\User;
use App\Repository\CustomerRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class CustomerControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private CustomerRepository $customerRepository;
    private UserRepository $userRepository;
    private $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->customerRepository = static::getContainer()->get(CustomerRepository::class);
        $this->userRepository = static::getContainer()->get(UserRepository::class);
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');

        // Nettoyer les tables de test
        $this->entityManager->createQuery('DELETE FROM App\Entity\Customer')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();
    }

    private function createTestUser(string $email = 'test@example.com', string $password = 'password'): User
    {
        $user = new User();
        $user->setName('Test User');
        $user->setEmail($email);
        $user->setPassword(password_hash($password, PASSWORD_BCRYPT));
        $user->setRoles(['ROLE_USER']); // Ajout du rôle requis
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

    public function testIndexUnauthenticated(): void
    {
        $this->client->request('GET', '/api/client');
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testIndexAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', '/api/client');
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }

    public function testShowUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId(), 'Customer1');
        $this->client->request('GET', "/api/client/{$testCustomer->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testShowAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId(), 'Customer1');
        $this->client->loginUser($testUser);

        $this->client->request('GET', "/api/client/{$testCustomer->getId()}");
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('surnom', $responseData);
        $this->assertEquals('Customer1', $responseData['surnom']);
    }

    public function testCreateUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->request(
            'POST',
            '/api/client',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['surnom' => 'NewCustomer', 'user_id' => $testUser->getId()])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testCreateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/client',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['surnom' => 'NewCustomer', 'user_id' => $testUser->getId()])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('surnom', $responseData);
        $this->assertEquals('NewCustomer', $responseData['surnom']);
    }

    public function testCreateWithInvalidData(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/client',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['user_id' => $testUser->getId()]) // Surnom manquant
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $responseData);
    }

    public function testUpdateUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId(), 'Customer1');
        $this->client->request(
            'PUT',
            "/api/client/{$testCustomer->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['surnom' => 'UpdatedCustomer'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testUpdateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId(), 'Customer1');
        $this->client->loginUser($testUser);

        $this->client->request(
            'PUT',
            "/api/client/{$testCustomer->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['surnom' => 'UpdatedCustomer'])
        );
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('surnom', $responseData);
        $this->assertEquals('UpdatedCustomer', $responseData['surnom']);
    }

    public function testDeleteUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId(), 'Customer1');
        $this->client->request('DELETE', "/api/client/{$testCustomer->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testDeleteAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId(), 'Customer1');
        $this->client->loginUser($testUser);

        $this->client->request('DELETE', "/api/client/{$testCustomer->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }
}