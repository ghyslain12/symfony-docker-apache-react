<?php

namespace App\Repository;

use App\Entity\Sale;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SaleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Sale::class);
    }

    public function findByTitre(string $titre): ?Sale
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.titre = :titre')
            ->setParameter('titre', $titre)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByCustomerId(int $customerId): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.customer = :customerId')
            ->setParameter('customerId', $customerId)
            ->getQuery()
            ->getResult();
    }
}
