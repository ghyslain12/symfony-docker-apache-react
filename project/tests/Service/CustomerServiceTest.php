<?php

namespace App\Tests\Service;

use App\Entity\Customer;
use App\Entity\User;
use App\Repository\CustomerRepository;
use App\Repository\UserRepository;
use App\Service\CustomerService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class CustomerServiceTest extends TestCase
{
    private CustomerService $customerService;
    private MockObject $entityManager;
    private MockObject $customerRepository;
    private MockObject $userRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->customerRepository = $this->createMock(CustomerRepository::class);
        $this->userRepository = $this->createMock(UserRepository::class);

        $this->customerService = new CustomerService(
            $this->customerRepository,
            $this->userRepository,
            $this->entityManager
        );
    }

    public function testGetAllCustomers(): void
    {
        $customers = [new Customer(), new Customer()];
        $this->customerRepository->expects($this->once())
            ->method('findAll')
            ->willReturn($customers);

        $result = $this->customerService->getAllCustomers();
        $this->assertSame($customers, $result);
        $this->assertCount(2, $result);
    }

    public function testGetCustomerById(): void
    {
        $customer = new Customer();
        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($customer);

        $result = $this->customerService->getCustomerById(1);
        $this->assertSame($customer, $result);
    }

    public function testGetCustomerByIdNotFound(): void
    {
        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $result = $this->customerService->getCustomerById(999);
        $this->assertNull($result);
    }

    public function testGetBySurnom(): void
    {
        $customer = new Customer();
        $this->customerRepository->expects($this->once())
            ->method('findBySurnom')
            ->with('TestCustomer')
            ->willReturn($customer);

        $result = $this->customerService->getBySurnom('TestCustomer');
        $this->assertSame($customer, $result);
    }

    public function testCreateCustomerSuccess(): void
    {
        $user = new User();
        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($user);

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($this->callback(function ($customer) {
                return $customer instanceof Customer &&
                    $customer->getSurnom() === 'NewCustomer' &&
                    $customer->getUser() !== null &&
                    $customer->getCreatedAt() instanceof \DateTimeInterface &&
                    $customer->getUpdatedAt() instanceof \DateTimeInterface;
            }));

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->customerService->createCustomer('NewCustomer', 1);
        $this->assertInstanceOf(Customer::class, $result);
        $this->assertEquals('NewCustomer', $result->getSurnom());
        $this->assertSame($user, $result->getUser());
    }

    public function testCreateCustomerUserNotFound(): void
    {
        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('persist');

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->customerService->createCustomer('NewCustomer', 999);
        $this->assertNull($result);
    }

    public function testUpdateCustomerSuccess(): void
    {
        $customer = new Customer();
        $customer->setSurnom('OldCustomer');
        $user = new User();

        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($customer);

        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(2)
            ->willReturn($user);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->customerService->updateCustomer(1, 'UpdatedCustomer', 2);
        $this->assertSame($customer, $result);
        $this->assertEquals('UpdatedCustomer', $customer->getSurnom());
        $this->assertSame($user, $customer->getUser());
        $this->assertInstanceOf(\DateTimeInterface::class, $customer->getUpdatedAt());
    }

    public function testUpdateCustomerPartialUpdate(): void
    {
        $customer = new Customer();
        $customer->setSurnom('OldCustomer');

        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($customer);

        $this->userRepository->expects($this->never())
            ->method('find');

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->customerService->updateCustomer(1, 'UpdatedCustomer', null);
        $this->assertSame($customer, $result);
        $this->assertEquals('UpdatedCustomer', $customer->getSurnom());
        $this->assertNull($customer->getUser()); // Pas de changement
    }

    public function testUpdateCustomerNotFound(): void
    {
        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->userRepository->expects($this->never())
            ->method('find');

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->customerService->updateCustomer(999, 'UpdatedCustomer', 2);
        $this->assertNull($result);
    }

    public function testDeleteCustomerSuccess(): void
    {
        $customer = new Customer();
        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($customer);

        $this->entityManager->expects($this->once())
            ->method('remove')
            ->with($customer);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->customerService->deleteCustomer(1);
        $this->assertTrue($result);
    }

    public function testDeleteCustomerNotFound(): void
    {
        $this->customerRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('remove');

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->customerService->deleteCustomer(999);
        $this->assertFalse($result);
    }
}