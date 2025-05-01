<?php

namespace App\Service;

use App\Entity\Customer;
use App\Repository\CustomerRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class CustomerService
{
    private EntityManagerInterface $entityManager;
    private CustomerRepository $customerRepository;
    private UserRepository $userRepository;

    public function __construct(CustomerRepository $customerRepository, UserRepository $userRepository, EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
        $this->customerRepository = $customerRepository;
        $this->userRepository = $userRepository;
    }

    public function getAllCustomers(): array
    {
        return $this->customerRepository->findAll();
    }

    public function getCustomerById(int $id): ?Customer
    {
        return $this->customerRepository->find($id);
    }

    public function getBySurnom(string $surnom): ?Customer
    {
        return $this->customerRepository->findBySurnom($surnom);
    }

    public function createCustomer(string $surnom, int $userId): ?Customer
    {
        $user = $this->userRepository->find($userId);
        if (!$user) {
            return null;
        }
        $customer = new Customer();
        $customer->setSurnom($surnom);
        $customer->setUser($user);
        $customer->setCreatedAt(new \DateTime());
        $customer->setUpdatedAt(new \DateTime());

        $this->entityManager->persist($customer);
        $this->entityManager->flush();

        return $customer;
    }

    public function updateCustomer(int $id, ?string $surnom, ?int $userId): ?Customer
    {
        $customer = $this->customerRepository->find($id);
        if (!$customer) {
            return null;
        }

        if ($surnom !== null) {
            $customer->setSurnom($surnom);
        }

        if ($userId !== null) {
            $user = $this->userRepository->find($userId);
            if ($user) {
                $customer->setUser($user);
            }
        }

        $customer->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();
        return $customer;
    }

    public function deleteCustomer(int $id): bool
    {
        $customer = $this->customerRepository->find($id);
        if (!$customer) {
            return false;
        }

        $this->entityManager->remove($customer);
        $this->entityManager->flush();
        return true;
    }
}