<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use stdClass;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: "App\Repository\TicketRepository")]
#[ORM\Table(name: "tickets")]
class Ticket
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['ticket:read'])]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255)]
    #[Assert\NotBlank(message: 'Titre cannot be blank.')]
    #[Groups(['ticket:read'])]
    private ?string $titre = null;

    #[ORM\Column(type: "text")]
    #[Assert\NotBlank(message: 'Description cannot be blank.')]
    #[Groups(['ticket:read'])]
    private ?string $description = null;

    #[ORM\ManyToMany(targetEntity: Sale::class)]
    #[ORM\JoinTable(name: "sale_ticket")]
    #[ORM\JoinColumn(name: "ticket_id", referencedColumnName: "id", onDelete: "CASCADE")]
    #[ORM\InverseJoinColumn(name: "sale_id", referencedColumnName: "id", onDelete: "CASCADE")]
    #[Groups(['ticket:read'])]
    private Collection $sales;

    #[ORM\Column(type: "datetime", nullable: true)]
    #[Groups(['ticket:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: "datetime", nullable: true)]
    #[Groups(['ticket:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->sales = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): self
    {
        $this->titre = $titre;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getSales(): Collection
    {
        return $this->sales;
    }

    public function addSale(Sale $sale): self
    {
        if (!$this->sales->contains($sale)) {
            $this->sales[] = $sale;
        }
        return $this;
    }

    public function removeSale(Sale $sale): self
    {
        $this->sales->removeElement($sale);
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function format(): array
    {
        $ticketArray = [
            'id' => $this->getId(),
            'titre' => $this->getTitre(),
            'description' => $this->getDescription(),
            'sales' => [],
            'created_at' => $this->getCreatedAt()?->format('c'),
            'updated_at' => $this->getUpdatedAt()?->format('c'),
        ];
        foreach ($this->getSales() as $sale) {
            $pivot = new stdClass();
            $pivot->ticket_id =$this->getId();
            $pivot->sale_id =$sale->getId();

            $ticketArray['sales'][] =  [
                'id' => $sale->getId(),
                'titre' => $sale->getTitre(),
                'description' => $sale->getDescription(),
                'created_at' => $sale->getCreatedAt(),
                'updated_at' => $sale->getUpdatedAt(),
                'pivot' => $pivot,
            ];
        }
        return $ticketArray;
    }
}