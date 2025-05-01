<?php

namespace App\Repository;

use App\Entity\Material;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MaterialRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Material::class);
    }

    public function findByDesignation(string $designation): ?Material
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.designation = :designation')
            ->setParameter('designation', $designation)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
