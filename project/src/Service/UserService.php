<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserService
{
    private UserRepository $userRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    
    public function __construct(UserRepository $userRepository, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher)
    {
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }
    
    public function getAllUsers(): array
    {
        return $this->userRepository->findAll();
    }

    public function getUserById(int $id): ?User
    {
        return $this->userRepository->find($id);
    }

    public function getByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }

    public function createUser(string $name, string $email, string $password): User
    {
        $user = new User();
        $user->setName($name);
        $user->setEmail($email);
        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);
        $user->setCreatedAt(new \DateTime());
        $user->setUpdatedAt(new \DateTime());
                
        $this->entityManager->persist($user);
        $this->entityManager->flush();
        
        return $user;
    }

    public function updateUser(int $id, ?string $name, ?string $email, ?string $password): ?User
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return null;
        }

        if ($name !== null) {
            $user->setName($name);
        }
        if ($email !== null) {
            $user->setEmail($email);
        }
        if ($password !== null) {
            $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
            $user->setPassword($hashedPassword);
        }

        $user->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();
        return $user;
    }

    public function deleteUser(int $id): bool
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return false;
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();
        return true;
    }
}