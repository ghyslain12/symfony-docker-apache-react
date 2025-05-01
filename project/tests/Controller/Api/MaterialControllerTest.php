<?php

namespace App\Tests\Controller\Api;

use App\Entity\Material;
use App\Entity\User;
use App\Repository\MaterialRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class MaterialControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private MaterialRepository $materialRepository;
    private UserRepository $userRepository;
    private $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->materialRepository = static::getContainer()->get(MaterialRepository::class);
        $this->userRepository = static::getContainer()->get(UserRepository::class);
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');

        // Nettoyer la table des matériaux pour les tests
        $this->entityManager->createQuery('DELETE FROM App\Entity\Material')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();
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

    public function testIndexUnauthenticated(): void
    {
        $this->client->request('GET', '/api/material');
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testIndexAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', '/api/material');
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }

    public function testShowUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testMaterial = $this->createTestMaterial($testUser->getId(), 'Material1');
        $this->client->request('GET', "/api/material/{$testMaterial->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testShowAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testMaterial = $this->createTestMaterial($testUser->getId(), 'Material1');
        $this->client->loginUser($testUser);

        $this->client->request('GET', "/api/material/{$testMaterial->getId()}");
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('designation', $responseData);
        $this->assertEquals('Material1', $responseData['designation']);
    }

    public function testShowNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', '/api/material/999');
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Material non trouvé', $responseData['error']);
    }

    public function testCreateUnauthenticated(): void
    {
        $this->client->request(
            'POST',
            '/api/material',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['designation' => 'NewMaterial'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testCreateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/material',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['designation' => 'NewMaterial'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('designation', $responseData);
        $this->assertEquals('NewMaterial', $responseData['designation']);
    }

    public function testCreateWithInvalidData(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/material',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([]) // Designation manquant
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Designation est requis', $responseData['error']);
    }

    public function testCreateWithDuplicateDesignation(): void
    {
        $testUser = $this->createTestUser();
        $this->createTestMaterial($testUser->getId(), 'DuplicateMaterial');
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/material',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['designation' => 'DuplicateMaterial'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Cette designation est déjà utilisée', $responseData['error']);
    }

    public function testUpdateUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testMaterial = $this->createTestMaterial($testUser->getId(), 'Material1');
        $this->client->request(
            'PUT',
            "/api/material/{$testMaterial->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['designation' => 'UpdatedMaterial'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testUpdateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testMaterial = $this->createTestMaterial($testUser->getId(), 'Material1');
        $this->client->loginUser($testUser);

        $this->client->request(
            'PUT',
            "/api/material/{$testMaterial->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['designation' => 'UpdatedMaterial'])
        );
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('designation', $responseData);
        $this->assertEquals('UpdatedMaterial', $responseData['designation']);
    }

    public function testUpdateNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'PUT',
            '/api/material/999',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['designation' => 'UpdatedMaterial'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Material non trouvé', $responseData['error']);
    }

    public function testDeleteUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testMaterial = $this->createTestMaterial($testUser->getId(), 'Material1');
        $this->client->request('DELETE', "/api/material/{$testMaterial->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testDeleteAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testMaterial = $this->createTestMaterial($testUser->getId(), 'Material1');
        $this->client->loginUser($testUser);

        $this->client->request('DELETE', "/api/material/{$testMaterial->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }

    public function testDeleteNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('DELETE', '/api/material/999');
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Material non trouvé', $responseData['error']);
    }

    public function testPing(): void
    {
        $this->client->request('GET', '/api/material/ping');
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('status', $responseData);
        $this->assertEquals('success', $responseData['status']);
        $this->assertArrayHasKey('message', $responseData);
        $this->assertEquals('ping', $responseData['message']);
    }
}