<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends AbstractController
{
    private SerializerInterface $serializer;

    public function __construct(SerializerInterface $serializer)
    {
        $this->serializer = $serializer;
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // Géré par LexikJWTAuthenticationBundle
        throw new \LogicException('This method should not be reached!');
    }

    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        $user = $this->getUser();
        return $this->json([
            'message' => 'Authentification réussie avec HS256 !',
            'user' => $user->getEmail(),
        ]);
    }

    #[Route('/api/config/jwt', name: 'api_get_jwt_env', methods: ['GET'])]
    public function getJwtEnv(): JsonResponse
    {
        $data = $this->serializer->serialize([
            'jwt_enabled' => $this->getParameter('jwt.enable') ?: 'false',
        ], 'json');

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }
}