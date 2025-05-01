<?php

namespace App\Tests\Service;

use App\Entity\Sale;
use App\Entity\Ticket;
use App\Repository\SaleRepository;
use App\Repository\TicketRepository;
use App\Service\TicketService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class TicketServiceTest extends TestCase
{
    private TicketService $ticketService;
    private MockObject $entityManager;
    private MockObject $ticketRepository;
    private MockObject $saleRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->ticketRepository = $this->createMock(TicketRepository::class);
        $this->saleRepository = $this->createMock(SaleRepository::class);

        $this->ticketService = new TicketService(
            $this->ticketRepository,
            $this->saleRepository,
            $this->entityManager
        );
    }

    public function testGetAllTickets(): void
    {
        $tickets = [new Ticket(), new Ticket()];
        $this->ticketRepository->expects($this->once())
            ->method('findAll')
            ->willReturn($tickets);

        $result = $this->ticketService->getAllTickets();
        $this->assertSame($tickets, $result);
        $this->assertCount(2, $result);
    }

    public function testGetTicketById(): void
    {
        $ticket = new Ticket();
        $this->ticketRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($ticket);

        $result = $this->ticketService->getTicketById(1);
        $this->assertSame($ticket, $result);
    }

    public function testGetTicketByIdNotFound(): void
    {
        $this->ticketRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $result = $this->ticketService->getTicketById(999);
        $this->assertNull($result);
    }

    public function testGetByTitre(): void
    {
        $ticket = new Ticket();
        $this->ticketRepository->expects($this->once())
            ->method('findByTitre')
            ->with('TestTicket')
            ->willReturn($ticket);

        $result = $this->ticketService->getByTitre('TestTicket');
        $this->assertSame($ticket, $result);
    }

    public function testCreateTicketSuccess(): void
    {
        $sale = new Sale();
        $this->saleRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($sale);

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($this->callback(function ($ticket) {
                return $ticket instanceof Ticket &&
                    $ticket->getTitre() === 'NewTicket' &&
                    $ticket->getDescription() === 'NewDescription' &&
                    $ticket->getSales()->count() === 1 &&
                    $ticket->getCreatedAt() instanceof \DateTimeInterface &&
                    $ticket->getUpdatedAt() instanceof \DateTimeInterface;
            }));

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->ticketService->createTicket('NewTicket', 'NewDescription', [1]);
        $this->assertInstanceOf(Ticket::class, $result);
        $this->assertEquals('NewTicket', $result->getTitre());
        $this->assertEquals('NewDescription', $result->getDescription());
        $this->assertCount(1, $result->getSales());
        $this->assertTrue($result->getSales()->contains($sale));
    }

    public function testCreateTicketWithNoSales(): void
    {
        $this->saleRepository->expects($this->never())
            ->method('find');

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($this->callback(function ($ticket) {
                return $ticket instanceof Ticket &&
                    $ticket->getTitre() === 'NewTicket' &&
                    $ticket->getDescription() === 'NewDescription' &&
                    $ticket->getSales()->count() === 0;
            }));

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->ticketService->createTicket('NewTicket', 'NewDescription');
        $this->assertInstanceOf(Ticket::class, $result);
        $this->assertEquals('NewTicket', $result->getTitre());
        $this->assertEquals('NewDescription', $result->getDescription());
        $this->assertCount(0, $result->getSales());
    }

    public function testUpdateTicketSuccess(): void
    {
        $ticket = new Ticket();
        $ticket->setTitre('OldTicket');
        $ticket->setDescription('OldDescription');
        $sale = new Sale();

        $this->ticketRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($ticket);

        $this->saleRepository->expects($this->once())
            ->method('find')
            ->with(2)
            ->willReturn($sale);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->ticketService->updateTicket(1, 'UpdatedTicket', 'UpdatedDescription', [2]);
        $this->assertSame($ticket, $result);
        $this->assertEquals('UpdatedTicket', $ticket->getTitre());
        $this->assertEquals('UpdatedDescription', $ticket->getDescription());
        $this->assertCount(1, $ticket->getSales());
        $this->assertTrue($ticket->getSales()->contains($sale));
        $this->assertInstanceOf(\DateTimeInterface::class, $ticket->getUpdatedAt());
    }

    public function testUpdateTicketPartialUpdate(): void
    {
        $ticket = new Ticket();
        $ticket->setTitre('OldTicket');
        $ticket->setDescription('OldDescription');

        $this->ticketRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($ticket);

        $this->saleRepository->expects($this->never())
            ->method('find');

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->ticketService->updateTicket(1, 'UpdatedTicket', null, null);
        $this->assertSame($ticket, $result);
        $this->assertEquals('UpdatedTicket', $ticket->getTitre());
        $this->assertEquals('OldDescription', $ticket->getDescription()); // Pas de changement
        $this->assertCount(0, $ticket->getSales()); // Pas de changement
        $this->assertInstanceOf(\DateTimeInterface::class, $ticket->getUpdatedAt());
    }

    public function testUpdateTicketNotFound(): void
    {
        $this->ticketRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->saleRepository->expects($this->never())
            ->method('find');

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->ticketService->updateTicket(999, 'UpdatedTicket', 'UpdatedDescription', [2]);
        $this->assertNull($result);
    }

    public function testDeleteTicketSuccess(): void
    {
        $ticket = new Ticket();
        $this->ticketRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($ticket);

        $this->entityManager->expects($this->once())
            ->method('remove')
            ->with($ticket);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->ticketService->deleteTicket(1);
        $this->assertTrue($result);
    }

    public function testDeleteTicketNotFound(): void
    {
        $this->ticketRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('remove');

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->ticketService->deleteTicket(999);
        $this->assertFalse($result);
    }
}