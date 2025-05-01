<?php

namespace App\Tests\Security;

use App\Security\TestAuthenticator;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\User\InMemoryUser;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\Authenticator\Passport\UserBadge;

class TestAuthenticatorTest extends TestCase
{
    private TestAuthenticator $authenticator;
    private MockObject $security;
    private MockObject $request;
    private MockObject $token;

    protected function setUp(): void
    {
        $this->security = $this->createMock(Security::class);
        $this->request = $this->createMock(Request::class);
        $this->token = $this->createMock(TokenInterface::class);
        $this->authenticator = new TestAuthenticator($this->security);
    }

    public function testSupportsPublicRoutes(): void
    {
        $publicRoutes = [
            '/api/login' => 'GET',
            '/api/utilisateur' => 'POST',
            '/api/utilisateur/ping' => 'GET',
            '/api/material/ping' => 'GET',
            '/api/config/jwt' => 'GET',
            '/api/doc' => 'GET',
            '/api/doc.json' => 'GET',
        ];

        foreach ($publicRoutes as $path => $method) {
            $this->request->method('getPathInfo')->willReturn($path);
            $this->request->method('getMethod')->willReturn($method);
            $this->assertFalse($this->authenticator->supports($this->request), "Route $path devrait être publique");
        }
    }

    public function testSupportsApiRoutes(): void
    {
        $this->request->method('getPathInfo')->willReturn('/api/sale');
        $this->assertTrue($this->authenticator->supports($this->request));

        $this->request->method('getPathInfo')->willReturn('/api/ticket/1');
        $this->assertTrue($this->authenticator->supports($this->request));
    }

    public function testSupportsNonApiRoute(): void
    {
        $this->request->method('getPathInfo')->willReturn('/login');
        $this->assertFalse($this->authenticator->supports($this->request));
    }

    public function testAuthenticateWithUser(): void
    {
        $user = new InMemoryUser('test@example.com', 'password');
        $this->security->expects($this->once()) // Une seule fois car on stocke $user
        ->method('getUser')
            ->willReturn($user);

        $passport = $this->authenticator->authenticate($this->request);
        $this->assertInstanceOf(SelfValidatingPassport::class, $passport);
        $this->assertEquals('test@example.com', $passport->getUser()->getUserIdentifier());
    }

    public function testAuthenticateWithoutUser(): void
    {
        $this->security->expects($this->once())
            ->method('getUser')
            ->willReturn(null);

        $this->expectException(AuthenticationException::class);
        $this->expectExceptionMessage('Authentication required');
        $this->authenticator->authenticate($this->request);
    }

    public function testOnAuthenticationSuccess(): void
    {
        $result = $this->authenticator->onAuthenticationSuccess($this->request, $this->token, 'main');
        $this->assertNull($result);
    }

    public function testOnAuthenticationFailure(): void
    {
        $exception = new AuthenticationException('Authentication required');
        $response = $this->authenticator->onAuthenticationFailure($this->request, $exception);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        $this->assertEquals('{"error":"Authentication required"}', $response->getContent());
    }
}