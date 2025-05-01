<?php

namespace App\Tests\Security;

use App\Security\JwtEnableVoter;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class JwtEnableVoterTest extends TestCase
{
    private JwtEnableVoter $voter;
    private MockObject $requestStack;
    private MockObject $request;
    private MockObject $token;

    protected function setUp(): void
    {
        $this->requestStack = $this->createMock(RequestStack::class);
        $this->request = $this->createMock(Request::class);
        $this->token = $this->createMock(TokenInterface::class);
    }

    public function testSupportsWithCorrectAttributeAndSubject(): void
    {
        $this->voter = new JwtEnableVoter('true', $this->requestStack);
        $this->assertTrue($this->voter->supports('IS_AUTHENTICATED_FULLY', new Request()));
    }

    public function testSupportsWithIncorrectAttribute(): void
    {
        $this->voter = new JwtEnableVoter('true', $this->requestStack);
        $this->assertFalse($this->voter->supports('ROLE_USER', new Request()));
    }

    public function testSupportsWithIncorrectSubject(): void
    {
        $this->voter = new JwtEnableVoter('true', $this->requestStack);
        $this->assertFalse($this->voter->supports('IS_AUTHENTICATED_FULLY', null));
    }

    public function testVoteWithJwtEnabled(): void
    {
        $this->voter = new JwtEnableVoter('true', $this->requestStack);
        $this->requestStack->expects($this->never())->method('getCurrentRequest');

        $result = $this->voter->voteOnAttribute('IS_AUTHENTICATED_FULLY', new Request(), $this->token);
        $this->assertFalse($result); // JWT activé : laisse le firewall décider
    }

    public function testVoteWithJwtDisabledAndApiPath(): void
    {
        $this->voter = new JwtEnableVoter('false', $this->requestStack);
        $this->request->method('getPathInfo')->willReturn('/api/sale');
        $this->requestStack->expects($this->once())
            ->method('getCurrentRequest')
            ->willReturn($this->request);

        $result = $this->voter->voteOnAttribute('IS_AUTHENTICATED_FULLY', new Request(), $this->token);
        $this->assertTrue($result); // JWT désactivé et chemin /api : autorise
    }

    public function testVoteWithJwtDisabledAndNonApiPath(): void
    {
        $this->voter = new JwtEnableVoter('false', $this->requestStack);
        $this->request->method('getPathInfo')->willReturn('/login');
        $this->requestStack->expects($this->once())
            ->method('getCurrentRequest')
            ->willReturn($this->request);

        $result = $this->voter->voteOnAttribute('IS_AUTHENTICATED_FULLY', new Request(), $this->token);
        $this->assertFalse($result); // JWT désactivé mais pas un chemin /api : refuse
    }
}