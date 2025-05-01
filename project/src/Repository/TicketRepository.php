<?php

namespace App\Repository;

use App\Entity\Ticket;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TicketRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Ticket::class);
    }

    public function findByTitre(string $titre): ?Ticket
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.titre = :titre')
            ->setParameter('titre', $titre)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findBySaleId(int $saleId): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.sale = :saleId')
            ->setParameter('saleId', $saleId)
            ->getQuery()
            ->getResult();
    }
}
