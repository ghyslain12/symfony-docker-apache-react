<?php

namespace App\Service;

use App\Entity\Ticket;
use App\Repository\SaleRepository;
use App\Repository\TicketRepository;
use Doctrine\ORM\EntityManagerInterface;

class TicketService
{
    private EntityManagerInterface $entityManager;
    private TicketRepository $ticketRepository;
    private SaleRepository $saleRepository;

    public function __construct(TicketRepository $ticketRepository, SaleRepository $saleRepository, EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
        $this->ticketRepository = $ticketRepository;
        $this->saleRepository = $saleRepository;
    }

    public function getAllTickets(): array
    {
        return $this->ticketRepository->findAll();
    }

    public function getTicketById(int $id): ?Ticket
    {
        return $this->ticketRepository->find($id);
    }

    public function getByTitre(string $titre): ?Ticket
    {
        return $this->ticketRepository->findByTitre($titre);
    }

    public function createTicket(string $titre, string $description, array $saleIds = []): ?Ticket
    {
        $ticket = new Ticket();
        $ticket->setTitre($titre);
        $ticket->setDescription($description);
        foreach ($saleIds as $saleId) {
            $sale = $this->saleRepository->find($saleId);
            if ($sale) {
                $ticket->addSale($sale);
            }
        }
        $ticket->setCreatedAt(new \DateTime());
        $ticket->setUpdatedAt(new \DateTime());

        $this->entityManager->persist($ticket);
        $this->entityManager->flush();

        return $ticket;
    }

    public function updateTicket(int $id, ?string $titre, ?string $description, ?array $saleIds = []): ?Ticket
    {
        $ticket = $this->ticketRepository->find($id);
        if (!$ticket) {
            return null;
        }

        if ($titre !== null) {
            $ticket->setTitre($titre);
        }

        if ($description !== null) {
            $ticket->setDescription($description);
        }

        if ($saleIds !== null) {
            foreach ($ticket->getSales() as $sale) {
                $ticket->removeSale($sale);
            }
            foreach ($saleIds as $saleId) {
                $sale = $this->saleRepository->find($saleId);
                if ($sale) {
                    $ticket->addSale($sale);
                }
            }
        }

        $ticket->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();
        return $ticket;
    }

    public function deleteTicket(int $id): bool
    {
        $ticket = $this->ticketRepository->find($id);
        if (!$ticket) {
            return false;
        }

        $this->entityManager->remove($ticket);
        $this->entityManager->flush();
        return true;
    }
}