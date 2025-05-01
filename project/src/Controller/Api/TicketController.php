<?php

namespace App\Controller\Api;

use App\Service\TicketService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/ticket')]
class TicketController extends AbstractController
{
    private TicketService $ticketService;
    private SerializerInterface $serializer;

    public function __construct(TicketService $ticketService, SerializerInterface $serializer)
    {
        $this->ticketService = $ticketService;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'api_ticket_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $tickets = $this->ticketService->getAllTickets();

        $data = array_map(function ($ticket) {
            return $ticket->format();
        }, $tickets);

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_ticket_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $ticket = $this->ticketService->getTicketById($id);
        if (!$ticket) {
            return $this->json(['error' => 'Ticket non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($ticket->format(), Response::HTTP_OK);

    }

    #[Route('', name: 'api_ticket_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if ($this->ticketService->getByTitre($data['titre'])) {
            return $this->json(['error' => 'Ce titre est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        $saleIds = $data['sales'] ?? [];

        $ticket = $this->ticketService->createTicket(
            $data['titre'],
            $data['description'],
            $saleIds
        );
        if (!$ticket) {
            return $this->json(['error' => 'Customer non trouvé'], Response::HTTP_BAD_REQUEST);
        }

        $json = $this->serializer->serialize($ticket->format(), 'json', ['groups' => 'ticket:read']);
        $ticketData = json_decode($json, true);

        $ticketData['sales'] = [];
        foreach ($ticket->format()['sales'] as $sale) {
            $ticketData['sales'][] = $sale;
        }

        return new JsonResponse($ticketData, Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_ticket_update', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $ticket = $this->ticketService->getTicketById($id);
        if (!$ticket) {
            return $this->json(['error' => 'Ticket non trouvé'], Response::HTTP_NOT_FOUND);
        }


        $data = json_decode($request->getContent(), true);
        $saleIds = $data['sales'] ?? [];
        $ticket = $this->ticketService->updateTicket(
            $id,
            $data['titre'] ?? null,
            $data['description'] ?? null,
            $saleIds
        );
        if (!$ticket) {
            return $this->json(['error' => 'Ticket non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($ticket->format(), 'json', ['groups' => 'ticket:read']);
        $ticketData = json_decode($json, true);

        $ticketData['sales'] = [];
        foreach ($ticket->format()['sales'] as $sale) {
            $ticketData['sales'][] = $sale;
        }

        return new JsonResponse($ticketData, Response::HTTP_OK);
     }

    #[Route('/{id}', name: 'api_ticket_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $ticket = $this->ticketService->getTicketById($id);
        if (!$ticket) {
            return $this->json(['error' => 'Ticket non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $this->ticketService->deleteTicket($id);
        return $this->json(['message' => 'Ticket supprimé'], Response::HTTP_NO_CONTENT);
    }
}