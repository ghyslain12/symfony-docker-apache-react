<?php

namespace App\Tests\Entity;

use App\Entity\Customer;
use App\Entity\Material;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class CustomerTest extends TestCase
{
    private Customer $customer;

    protected function setUp(): void
    {
        $this->customer = new Customer();
    }

    public function testId(): void
    {
        $this->assertNull($this->customer->getId());
    }

    public function testSurnom(): void
    {
        $this->customer->setSurnom('Test Surnom');
        $this->assertSame('Test Surnom', $this->customer->getSurnom());
    }

    public function testUser(): void
    {
        $user = new User();
        $this->customer->setUser($user);
        $this->assertSame($user, $this->customer->getUser());
    }

    public function testCreatedAt(): void
    {
        $date = new \DateTime();
        $this->customer->setCreatedAt($date);
        $this->assertSame($date, $this->customer->getCreatedAt());
    }

    public function testUpdatedAt(): void
    {
        $date = new \DateTime();
        $this->customer->setUpdatedAt($date);
        $this->assertSame($date, $this->customer->getUpdatedAt());
    }

    public function testConstructorSetsTimestamps(): void
    {
        $customer = new Customer();
        $this->assertInstanceOf(\DateTimeInterface::class, $customer->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $customer->getUpdatedAt());
    }

    public function testFormat(): void
    {
        $user = new User();
        $user->setId(1);
        $user->setName('Test User');
        $user->setEmail('test@test.com');

        $this->customer->setId(1);
        $this->customer->setSurnom('Test Customer');
        $this->customer->setUser($user);
        $this->customer->setCreatedAt(new \DateTime('2023-01-01T00:00:00+00:00'));
        $this->customer->setUpdatedAt(new \DateTime('2023-01-02T00:00:00+00:00'));

        $formatted = $this->customer->format();

        $this->assertEquals([
            'id' => 1,
            'surnom' => 'Test Customer',
            'user_id' => 1,
            'created_at' => '2023-01-01T00:00:00+00:00',
            'updated_at' => '2023-01-02T00:00:00+00:00',
            'user' => [
                'id' => 1,
                'name' => 'Test User',
                'email' => 'test@test.com',
            ]
        ], $formatted);
    }
}