<?php

namespace App\Controller\Api;

use App\Service\CustomerService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/client')]
class CustomerController extends AbstractController
{
    private CustomerService $customerService;
    private SerializerInterface $serializer;

    public function __construct(CustomerService $customerService, SerializerInterface $serializer)
    {
        $this->customerService = $customerService;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'api_customer_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $customers = $this->customerService->getAllCustomers();

        $data = array_map(function ($customer) {
            return $customer->format();
        }, $customers);

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_customer_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $customer = $this->customerService->getCustomerById($id);
        if (!$customer) {
            return $this->json(['error' => 'Customer non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($customer->format(), Response::HTTP_OK);

    }

    #[Route('', name: 'api_customer_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['surnom'], $data['user_id'])) {
            return $this->json(['error' => 'Surnom et user_id sont requis'], Response::HTTP_BAD_REQUEST);
        }

        if ($this->customerService->getBySurnom($data['surnom'])) {
            return $this->json(['error' => 'Ce surnom est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        $customer = $this->customerService->createCustomer($data['surnom'], $data['user_id']);
        if (!$customer) {
            return $this->json(['error' => 'User non trouvé'], Response::HTTP_BAD_REQUEST);
        }

        $json = $this->serializer->serialize($customer->format(), 'json', ['groups' => 'customer:read']);
        $customerData = json_decode($json, true);

        return new JsonResponse($customerData, Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_customer_update', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $customer = $this->customerService->getCustomerById($id);
        if (!$customer) {
            return $this->json(['error' => 'Customer non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $customer = $this->customerService->updateCustomer(
            $id,
            $data['surnom'] ?? null,
            $data['user_id'] ?? null
        );
        if (!$customer) {
            return $this->json(['error' => 'Customer non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($customer->format(), 'json', ['groups' => 'customer:read']);
        $customerData = json_decode($json, true);

        return new JsonResponse($customerData, Response::HTTP_OK);
     }

    #[Route('/{id}', name: 'api_customer_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $customer = $this->customerService->getCustomerById($id);
        if (!$customer) {
            return $this->json(['error' => 'Customer non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $this->customerService->deleteCustomer($id);
        return $this->json(['message' => 'Customer supprimé'], Response::HTTP_NO_CONTENT);
    }
}