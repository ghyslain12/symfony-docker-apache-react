<?php

namespace App\Tests\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    private User $user;

    protected function setUp(): void
    {
        $this->user = new User();
    }

    public function testId(): void
    {
        $this->assertNull($this->user->getId());
        $this->user->setId(1);
        $this->assertSame(1, $this->user->getId());
    }

    public function testName(): void
    {
        $this->assertNull($this->user->getName());
        $this->user->setName('John Doe');
        $this->assertSame('John Doe', $this->user->getName());
    }

    public function testEmail(): void
    {
        $this->assertNull($this->user->getEmail());
        $this->user->setEmail('john.doe@example.com');
        $this->assertSame('john.doe@example.com', $this->user->getEmail());
    }

    public function testPassword(): void
    {
        $this->assertNull($this->user->getPassword());
        $this->user->setPassword('hashed_password');
        $this->assertSame('hashed_password', $this->user->getPassword());
    }

    public function testCreatedAt(): void
    {
        $date = new \DateTime('2023-01-01');
        $this->assertInstanceOf(\DateTimeInterface::class, $this->user->getCreatedAt()); // Set par le constructeur
        $this->user->setCreatedAt($date);
        $this->assertSame($date, $this->user->getCreatedAt());
    }

    public function testUpdatedAt(): void
    {
        $date = new \DateTime('2023-01-02');
        $this->assertInstanceOf(\DateTimeInterface::class, $this->user->getUpdatedAt()); // Set par le constructeur
        $this->user->setUpdatedAt($date);
        $this->assertSame($date, $this->user->getUpdatedAt());
    }

    public function testConstructorSetsTimestamps(): void
    {
        $user = new User();
        $this->assertInstanceOf(\DateTimeInterface::class, $user->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $user->getUpdatedAt());
    }

    public function testGetRoles(): void
    {
        $roles = $this->user->getRoles();
        $this->assertIsArray($roles);
        $this->assertEquals(['ROLE_USER'], $roles);
    }

    public function testSetRoles(): void
    {
        $this->user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        $this->assertEquals(['ROLE_ADMIN', 'ROLE_USER'], $this->user->getRoles());
    }

    public function testGetUserIdentifier(): void
    {
        $this->user->setEmail('john.doe@example.com');
        $this->assertSame('john.doe@example.com', $this->user->getUserIdentifier());
    }

    public function testEraseCredentials(): void
    {
        // Comme eraseCredentials() n’a pas d’implémentation, on vérifie juste qu’elle ne lève pas d’erreur
        $this->user->eraseCredentials();
        $this->assertTrue(true); // Si on arrive ici, pas d’exception
    }
}