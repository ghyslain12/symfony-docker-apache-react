<?php

namespace App\Tests\Entity;

use App\Entity\Customer;
use App\Entity\Material;
use App\Entity\Sale;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

class SaleTest extends TestCase
{
    private Sale $sale;

    protected function setUp(): void
    {
        $this->sale = new Sale();
    }

    public function testId(): void
    {
        $this->assertNull($this->sale->getId());
    }

    public function testTitre(): void
    {
        $this->sale->setTitre('Test Sale');
        $this->assertSame('Test Sale', $this->sale->getTitre());
    }

    public function testDescription(): void
    {
        $this->sale->setDescription('Test Description');
        $this->assertSame('Test Description', $this->sale->getDescription());
    }

    public function testCustomer(): void
    {
        $customer = new Customer();
        $this->sale->setCustomer($customer);
        $this->assertSame($customer, $this->sale->getCustomer());
    }

    public function testMaterials(): void
    {
        $material = new Material();
        $this->sale->addMaterial($material);
        $this->assertCount(1, $this->sale->getMaterials());
        $this->assertTrue($this->sale->getMaterials()->contains($material));

        $this->sale->removeMaterial($material);
        $this->assertCount(0, $this->sale->getMaterials());
    }

    public function testCreatedAt(): void
    {
        $date = new \DateTime();
        $this->sale->setCreatedAt($date);
        $this->assertSame($date, $this->sale->getCreatedAt());
    }

    public function testUpdatedAt(): void
    {
        $date = new \DateTime();
        $this->sale->setUpdatedAt($date);
        $this->assertSame($date, $this->sale->getUpdatedAt());
    }

    public function testConstructorSetsTimestamps(): void
    {
        $sale = new Sale();
        $this->assertInstanceOf(\DateTimeInterface::class, $sale->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $sale->getUpdatedAt());
        $this->assertInstanceOf(ArrayCollection::class, $sale->getMaterials());
    }

    public function testFormat(): void
    {
        $customer = new Customer();
        $customer->setId(1);
        $customer->setSurnom('TestCustomer');

        $material = new Material();
        $material->setId(2);
        $material->setDesignation('TestMaterial');
        $material->setCreatedAt(new \DateTime('2023-01-01'));
        $material->setUpdatedAt(new \DateTime('2023-01-02'));

        $this->sale->setId(1);
        $this->sale->setTitre('Test Sale');
        $this->sale->setDescription('Test Description');
        $this->sale->setCustomer($customer);
        $this->sale->addMaterial($material);
        $this->sale->setCreatedAt(new \DateTime('2023-01-01T00:00:00+00:00'));
        $this->sale->setUpdatedAt(new \DateTime('2023-01-02T00:00:00+00:00'));

        $formatted = $this->sale->format();

        $this->assertEquals([
            'id' => 1,
            'titre' => 'Test Sale',
            'description' => 'Test Description',
            'customer_id' => 1,
            'materials' => [
                [
                    'id' => 2,
                    'designation' => 'TestMaterial',
                    'created_at' => $material->getCreatedAt(),
                    'updated_at' => $material->getUpdatedAt(),
                    'pivot' => (object) ['sale_id' => 1, 'material_id' => 2],
                ],
            ],
            'created_at' => '2023-01-01T00:00:00+00:00',
            'updated_at' => '2023-01-02T00:00:00+00:00',
            'customer' => [
                'id' => 1,
                'surnom' => 'TestCustomer',
            ],
        ], $formatted);
    }
}