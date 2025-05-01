<?php

namespace App\Tests\Repository;

use App\Entity\Ticket;
use App\Repository\TicketRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class TicketRepositoryTest extends KernelTestCase
{
    private TicketRepository $ticketRepository;
    private $entityManager;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()->get('doctrine')->getManager();
        $this->ticketRepository = $this->entityManager->getRepository(Ticket::class);

        $this->entityManager->createQuery('DELETE FROM App\Entity\Ticket')->execute();
    }

    public function testFindByTitre(): void
    {
        $ticket = new Ticket();
        $ticket->setTitre('Test Ticket Titre');
        $ticket->setDescription('Test Ticket Description');
        $this->entityManager->persist($ticket);
        $this->entityManager->flush();

        $foundTicket = $this->ticketRepository->findByTitre('Test Ticket Titre');
        $this->assertNotNull($foundTicket);
        $this->assertEquals('Test Ticket Titre', $foundTicket->getTitre());

        $notFoundTicket = $this->ticketRepository->findByTitre('Non Existent');
        $this->assertNull($notFoundTicket);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
    }
}