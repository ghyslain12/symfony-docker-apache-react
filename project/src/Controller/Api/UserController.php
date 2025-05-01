<?php

namespace App\Controller\Api;

use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/utilisateur')]
class UserController extends AbstractController
{
    private UserService $userService;
    private SerializerInterface $serializer;

    public function __construct(UserService $userService, SerializerInterface $serializer)
    {
        $this->userService = $userService;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'api_user_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $users = $this->userService->getAllUsers();
        $data = $this->serializer->serialize($users, 'json', ['groups' => 'user:read']);
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_user_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        if (!$user) {
            return $this->json(['error' => 'User non trouvé'], Response::HTTP_NOT_FOUND);
        }
        $data = $this->serializer->serialize($user, 'json', ['groups' => 'user:read']);
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'api_user_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['name'], $data['email'], $data['password'])) {
            return $this->json(['error' => 'Name, email et password sont requis'], Response::HTTP_BAD_REQUEST);
        }

        if ($this->userService->getByEmail($data['email'])) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        $user = $this->userService->createUser($data['name'], $data['email'], $data['password']);
        $json = $this->serializer->serialize($user, 'json', ['groups' => 'user:read']);
        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'api_user_update', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        if (!$user) {
            return $this->json(['error' => 'User non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $user = $this->userService->updateUser(
            $id,
            $data['name'] ?? null,
            $data['email'] ?? null,
            $data['password'] ?? null
        );
        $data = $this->serializer->serialize($user, 'json', ['groups' => 'user:read']);
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_user_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        if (!$user) {
            return $this->json(['error' => 'User non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $this->userService->deleteUser($id);
        return $this->json(['message' => 'User supprimé'], Response::HTTP_NO_CONTENT);
    }

    #[Route('/ping', name: 'api_user_ping', methods: ['GET'])]
    public function ping(): JsonResponse
    {
        $data = $this->serializer->serialize([
            'status' => 'success',
            'message' => 'ping',
            'timestamp' => new \DateTime()
        ], 'json');

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }
}