<?php

namespace App\Tests\Controller\Api;

use App\Entity\Customer;
use App\Entity\Sale;
use App\Entity\Ticket;
use App\Entity\User;
use App\Repository\CustomerRepository;
use App\Repository\SaleRepository;
use App\Repository\TicketRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class TicketControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private TicketRepository $ticketRepository;
    private UserRepository $userRepository;
    private CustomerRepository $customerRepository;
    private SaleRepository $saleRepository;
    private $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->ticketRepository = static::getContainer()->get(TicketRepository::class);
        $this->userRepository = static::getContainer()->get(UserRepository::class);
        $this->customerRepository = static::getContainer()->get(CustomerRepository::class);
        $this->saleRepository = static::getContainer()->get(SaleRepository::class);
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');

        // Nettoyer les tables pour les tests
        $this->entityManager->createQuery('DELETE FROM App\Entity\Ticket')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Sale')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Customer')->execute();
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

    private function createTestSale(int $customerId, string $titre = 'TestSale'): Sale
    {
        $sale = new Sale();
        $sale->setTitre($titre);
        $sale->setDescription('Description de test');
        $sale->setCustomer($this->customerRepository->find($customerId));
        $sale->setCreatedAt(new \DateTime());
        $sale->setUpdatedAt(new \DateTime());
        $this->entityManager->persist($sale);
        $this->entityManager->flush();
        return $sale;
    }

    private function createTestTicket(string $titre = 'TestTicket', array $saleIds = []): Ticket
    {
        $ticket = new Ticket();
        $ticket->setTitre($titre);
        $ticket->setDescription('Description de test');
        $ticket->setCreatedAt(new \DateTime());
        $ticket->setUpdatedAt(new \DateTime());
        foreach ($saleIds as $saleId) {
            $ticket->addSale($this->saleRepository->find($saleId));
        }
        $this->entityManager->persist($ticket);
        $this->entityManager->flush();
        return $ticket;
    }

    public function testIndexUnauthenticated(): void
    {
        $this->client->request('GET', '/api/ticket');
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testIndexAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', '/api/ticket');
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }

    public function testShowUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $testTicket = $this->createTestTicket('TestTicket', [$testSale->getId()]);
        $this->client->request('GET', "/api/ticket/{$testTicket->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testShowAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $testTicket = $this->createTestTicket('TestTicket', [$testSale->getId()]);
        $this->client->loginUser($testUser);

        $this->client->request('GET', "/api/ticket/{$testTicket->getId()}");
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('titre', $responseData);
        $this->assertEquals('TestTicket', $responseData['titre']);
        $this->assertArrayHasKey('sales', $responseData);
        $this->assertCount(1, $responseData['sales']);
    }

    public function testShowNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('GET', '/api/ticket/999');
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Ticket non trouvé', $responseData['error']);
    }

    public function testCreateUnauthenticated(): void
    {
        $this->client->request(
            'POST',
            '/api/ticket',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'NewTicket'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testCreateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/ticket',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titre' => 'NewTicket',
                'description' => 'Description',
                'sales' => [$testSale->getId()]
            ])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('titre', $responseData);
        $this->assertEquals('NewTicket', $responseData['titre']);
        $this->assertArrayHasKey('sales', $responseData);
        $this->assertCount(1, $responseData['sales']);
    }

    public function testCreateWithDuplicateTitre(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $this->createTestTicket('DuplicateTicket');
        $this->client->loginUser($testUser);

        $this->client->request(
            'POST',
            '/api/ticket',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'DuplicateTicket', 'sales' => [$testSale->getId()]])
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
        $testTicket = $this->createTestTicket('TestTicket', [$testSale->getId()]);
        $this->client->request(
            'PUT',
            "/api/ticket/{$testTicket->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'UpdatedTicket'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testUpdateAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $testTicket = $this->createTestTicket('TestTicket', [$testSale->getId()]);
        $this->client->loginUser($testUser);

        $this->client->request(
            'PUT',
            "/api/ticket/{$testTicket->getId()}",
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titre' => 'UpdatedTicket',
                'description' => 'Updated Description',
                'sales' => [$testSale->getId()]
            ])
        );
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('titre', $responseData);
        $this->assertEquals('UpdatedTicket', $responseData['titre']);
        $this->assertArrayHasKey('sales', $responseData);
        $this->assertCount(1, $responseData['sales']);
    }

    public function testUpdateNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request(
            'PUT',
            '/api/ticket/999',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'UpdatedTicket'])
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Ticket non trouvé', $responseData['error']);
    }

    public function testDeleteUnauthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $testTicket = $this->createTestTicket('TestTicket', [$testSale->getId()]);
        $this->client->request('DELETE', "/api/ticket/{$testTicket->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testDeleteAuthenticated(): void
    {
        $testUser = $this->createTestUser();
        $testCustomer = $this->createTestCustomer($testUser->getId());
        $testSale = $this->createTestSale($testCustomer->getId());
        $testTicket = $this->createTestTicket('TestTicket', [$testSale->getId()]);
        $this->client->loginUser($testUser);

        $this->client->request('DELETE', "/api/ticket/{$testTicket->getId()}");
        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }

    public function testDeleteNotFound(): void
    {
        $testUser = $this->createTestUser();
        $this->client->loginUser($testUser);

        $this->client->request('DELETE', '/api/ticket/999');
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Ticket non trouvé', $responseData['error']);
    }
}