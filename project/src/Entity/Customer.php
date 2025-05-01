<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: "App\Repository\CustomerRepository")]
#[ORM\Table(name: "customers")]
class Customer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['customer:read', 'sale:read', 'ticket:read'])]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255)]
    #[Assert\NotBlank(message: 'Surnom cannot be blank.')]
    #[Groups(['customer:read', 'sale:read', 'ticket:read'])]
    private ?string $surnom = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['customer:read'])]
    private ?User $user = null;

    #[ORM\Column(type: "datetime", nullable: true)]
    #[Groups(['customer:read', 'ticket:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: "datetime", nullable: true)]
    #[Groups(['customer:read', 'ticket:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getSurnom(): ?string
    {
        return $this->surnom;
    }

    public function setSurnom(?string $surnom): void
    {
        $this->surnom = $surnom;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeInterface $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): void
    {
        $this->user = $user;
    }

    public function format(): array
    {
        return [
            'id' => $this->getId(),
            'surnom' => $this->getSurnom(),
            'user_id' => $this->getUser()->getId(),
            'created_at' => $this->getCreatedAt()?->format('c'),
            'updated_at' => $this->getUpdatedAt()?->format('c'),
            'user' => [
                'id' => $this->getUser()->getId(),
                'name' => $this->getUser()->getName(),
                'email' => $this->getUser()->getEmail(),
            ],
        ];
    }
}
