<?php

namespace App\Tests\Entity;

use App\Entity\Sale;
use App\Entity\Ticket;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

class TicketTest extends TestCase
{
    private Ticket $ticket;

    protected function setUp(): void
    {
        $this->ticket = new Ticket();
    }

    public function testId(): void
    {
        $this->assertNull($this->ticket->getId());
    }

    public function testTitre(): void
    {
        $this->ticket->setTitre('Test Ticket');
        $this->assertSame('Test Ticket', $this->ticket->getTitre());
    }

    public function testDescription(): void
    {
        $this->ticket->setDescription('Test Description');
        $this->assertSame('Test Description', $this->ticket->getDescription());
    }
    
    public function testSales(): void
    {
        $sale = new Sale();
        $this->ticket->addSale($sale);
        $this->assertCount(1, $this->ticket->getSales());
        $this->assertTrue($this->ticket->getSales()->contains($sale));

        $this->ticket->removeSale($sale);
        $this->assertCount(0, $this->ticket->getSales());
    }

    public function testCreatedAt(): void
    {
        $date = new \DateTime();
        $this->ticket->setCreatedAt($date);
        $this->assertSame($date, $this->ticket->getCreatedAt());
    }

    public function testUpdatedAt(): void
    {
        $date = new \DateTime();
        $this->ticket->setUpdatedAt($date);
        $this->assertSame($date, $this->ticket->getUpdatedAt());
    }

    public function testConstructorSetsTimestamps(): void
    {
        $ticket = new Ticket();
        $this->assertInstanceOf(\DateTimeInterface::class, $ticket->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $ticket->getUpdatedAt());
        $this->assertInstanceOf(ArrayCollection::class, $ticket->getSales());
    }

    public function testFormat(): void
    {
        $sale = new Sale();
        $sale->setId(2);
        $sale->setTitre('Test Sale Titre');
        $sale->setDescription('Test Sale Description');
        $sale->setCreatedAt(new \DateTime('2023-01-01'));
        $sale->setUpdatedAt(new \DateTime('2023-01-02'));

        $this->ticket->setId(1);
        $this->ticket->setTitre('Test Ticket');
        $this->ticket->setDescription('Test Description');
        $this->ticket->addSale($sale);
        $this->ticket->setCreatedAt(new \DateTime('2023-01-01T00:00:00+00:00'));
        $this->ticket->setUpdatedAt(new \DateTime('2023-01-02T00:00:00+00:00'));

        $formatted = $this->ticket->format();

        $this->assertEquals([
            'id' => 1,
            'titre' => 'Test Ticket',
            'description' => 'Test Description',
            'sales' => [
                [
                    'id' => 2,
                    'titre' => 'Test Sale Titre',
                    'description' => 'Test Sale Description',
                    'created_at' => $sale->getCreatedAt(),
                    'updated_at' => $sale->getUpdatedAt(),
                    'pivot' => (object) ['ticket_id' => 1, 'sale_id' => 2],
                ],
            ],
            'created_at' => '2023-01-01T00:00:00+00:00',
            'updated_at' => '2023-01-02T00:00:00+00:00',
        ], $formatted);
    }
}