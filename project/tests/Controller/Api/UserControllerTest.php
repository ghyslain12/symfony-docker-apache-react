<?php

namespace App\Tests\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class UserControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');

        // Nettoyer la table des utilisateurs pour les tests
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

    public function testIndexUnauthenticated(): void
    {
        $this->client->request('GET', '/api/utilisateur');
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testIndexAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', '/api/utilisateur');
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }

    public function testShowUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->request('GET', "/api/utilisateur/{$testUser->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testShowAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', "/api/utilisateur/{$testUser->getId()}");
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('email', $responseData);
        $this->assertEquals('test@example.com', $responseData['email']);
    }

    public function testCreateUnauthenticated(): void
    {
        $this->client->request(
            'POST',
            '/api/utilisateur',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'New User', 'email' => 'new@example.com', 'password' => 'password'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('email', $responseData);
        $this->assertEquals('new@example.com', $responseData['email']);
    }

    public function testCreateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/utilisateur',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'New User', 'email' => 'new@example.com', 'password' => 'password'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('email', $responseData);
        $this->assertEquals('new@example.com', $responseData['email']);
    }

    public function testCreateWithInvalidData(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/utilisateur',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'New User']) // Email manquant
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testUpdateUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->request(
            'PUT',
            "/api/utilisateur/{$testUser->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'Updated User'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testUpdateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'PUT',
            "/api/utilisateur/{$testUser->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'Updated User'])
        );
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('name', $responseData);
        $this->assertEquals('Updated User', $responseData['name']);
    }

    public function testDeleteUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->request('DELETE', "/api/utilisateur/{$testUser->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testDeleteAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('DELETE', "/api/utilisateur/{$testUser->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }
}