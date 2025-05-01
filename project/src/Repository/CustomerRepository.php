<?php

namespace App\Repository;

use App\Entity\Customer;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CustomerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Customer::class);
    }

    public function findBySurnom(string $surnom): ?Customer
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.surnom = :surnom')
            ->setParameter('surnom', $surnom)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByUserId(int $userId): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();
    }
}
