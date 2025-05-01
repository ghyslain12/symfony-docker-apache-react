<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use stdClass;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: "App\Repository\SaleRepository")]
#[ORM\Table(name: "sales")]
class Sale
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['sale:read', 'ticket:read'])]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255)]
    #[Assert\NotBlank(message: 'Titre cannot be blank.')]
    #[Groups(['sale:read', 'ticket:read'])]
    private ?string $titre = null;

    #[ORM\Column(type: "text")]
    #[Assert\NotBlank(message: 'Description cannot be blank.')]
    #[Groups(['sale:read', 'ticket:read'])]
    private ?string $description = null;

    #[ORM\ManyToOne(targetEntity: Customer::class)]
    #[ORM\JoinColumn(name: "customer_id", referencedColumnName: "id", nullable: false, onDelete: "CASCADE")]
    #[Groups(['sale:read', 'ticket:read'])]
    private ?Customer $customer = null;

    #[ORM\ManyToMany(targetEntity: Material::class)]
    #[ORM\JoinTable(name: "material_sale")]
    #[ORM\JoinColumn(name: "sale_id", referencedColumnName: "id", onDelete: "CASCADE")]
    #[ORM\InverseJoinColumn(name: "material_id", referencedColumnName: "id", onDelete: "CASCADE")]
    #[Groups(['sale:read'])]
    private Collection $materials;

    #[ORM\Column(type: "datetime", nullable: true)]
    #[Groups(['sale:read', 'ticket:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: "datetime", nullable: true)]
    #[Groups(['sale:read', 'ticket:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->materials = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
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

    public function setId(int $id): self
    {
        $this->id = $id;
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

    public function getCustomer(): ?Customer
    {
        return $this->customer;
    }

    public function setCustomer(?Customer $customer): self
    {
        $this->customer = $customer;
        return $this;
    }

    public function getMaterials(): Collection
    {
        return $this->materials;
    }

    public function addMaterial(Material $material): self
    {
        if (!$this->materials->contains($material)) {
            $this->materials[] = $material;
        }
        return $this;
    }

    public function removeMaterial(Material $material): self
    {
        $this->materials->removeElement($material);
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
        $saleArray = [
            'id' => $this->getId(),
            'titre' => $this->getTitre(),
            'description' => $this->getDescription(),
            'customer_id' => $this->getCustomer()->getId(),
            'materials' => [],
            'created_at' => $this->getCreatedAt()?->format('c'),
            'updated_at' => $this->getUpdatedAt()?->format('c'),
            'customer' => [
                'id' => $this->getCustomer()->getId(),
                'surnom' => $this->getCustomer()->getSurnom(),
            ]
        ];

        foreach ($this->getMaterials() as $material) {
            $pivot = new stdClass();
            $pivot->sale_id =$this->getId();
            $pivot->material_id =$material->getId();

            $saleArray['materials'][] =  [
                'id' => $material->getId(),
                'designation' => $material->getDesignation(),
                'created_at' => $material->getCreatedAt(),
                'updated_at' => $material->getUpdatedAt(),
                'pivot' => $pivot,
            ];
        }
        return $saleArray;
    }
}