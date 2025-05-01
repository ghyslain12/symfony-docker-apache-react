<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Core\Security;

class TestAuthenticator extends AbstractAuthenticator
{
    private Security $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    public function supports(Request $request): ?bool
    {
        $path = $request->getPathInfo();
        if ($path === '/api/login' ||
            ($path === '/api/utilisateur' && $request->getMethod() === 'POST') ||
            $path === '/api/utilisateur/ping' ||
            $path === '/api/material/ping' ||
            $path === '/api/config/jwt' ||
            preg_match('#^/api/doc($|\.json)#', $path)) {
            return false;
        }

        return str_starts_with($path, '/api');
    }

    public function authenticate(Request $request): Passport
    {
        $user = $this->security->getUser();
        if ($user) {
            // Fournir une closure qui retourne directement l'utilisateur
            return new SelfValidatingPassport(new UserBadge($user->getUserIdentifier(), fn() => $user));
        }

        throw new AuthenticationException('Authentication required');
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
    }
}