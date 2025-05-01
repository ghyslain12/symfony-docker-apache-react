<?php

namespace App\Tests\Entity;

use App\Entity\Customer;
use App\Entity\Material;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

class MaterialTest extends TestCase
{
    private Material $material;

    protected function setUp(): void
    {
        $this->material = new Material();
    }

    public function testId(): void
    {
        $this->assertNull($this->material->getId());
    }

    public function testDesignation(): void
    {
        $this->material->setDesignation('Test Designation');
        $this->assertSame('Test Designation', $this->material->getDesignation());
    }

    public function testCreatedAt(): void
    {
        $date = new \DateTime();
        $this->material->setCreatedAt($date);
        $this->assertSame($date, $this->material->getCreatedAt());
    }

    public function testUpdatedAt(): void
    {
        $date = new \DateTime();
        $this->material->setUpdatedAt($date);
        $this->assertSame($date, $this->material->getUpdatedAt());
    }

    public function testConstructorSetsTimestamps(): void
    {
        $material = new Material();
        $this->assertInstanceOf(\DateTimeInterface::class, $material->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $material->getUpdatedAt());
    }
}