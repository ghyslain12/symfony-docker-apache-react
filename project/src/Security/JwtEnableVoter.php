<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class JwtEnableVoter extends Voter
{
    private bool $jwtEnabled;
    private RequestStack $requestStack;

    public function __construct(string $jwtEnabled, RequestStack $requestStack)
    {
        $this->jwtEnabled = filter_var($jwtEnabled, FILTER_VALIDATE_BOOLEAN);
        $this->requestStack = $requestStack;
    }

    public function supports(string $attribute, $subject): bool
    {
        return $attribute === 'IS_AUTHENTICATED_FULLY' && $subject instanceof \Symfony\Component\HttpFoundation\Request;
    }

    public function voteOnAttribute(string $attribute, $subject, TokenInterface $token): bool
    {
        if ($this->jwtEnabled) {
            // JWT activé : comportement normal
            return false; // Laisse le firewall JWT décider
        }

        $request = $this->requestStack->getCurrentRequest();
        if (strpos($request->getPathInfo(), '/api') === 0) {
            // JWT désactivé : autorise l'accès pour /api
            return true;
        }

        return false;
    }
}