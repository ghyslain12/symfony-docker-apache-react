<?php

namespace App\Tests\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\UserService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserServiceTest extends TestCase
{
    private UserService $userService;
    private MockObject $entityManager;
    private MockObject $userRepository;
    private MockObject $passwordHasher;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);

        $this->userService = new UserService(
            $this->userRepository,
            $this->entityManager,
            $this->passwordHasher
        );
    }

    public function testGetAllUsers(): void
    {
        $users = [new User(), new User()];
        $this->userRepository->expects($this->once())
            ->method('findAll')
            ->willReturn($users);

        $result = $this->userService->getAllUsers();
        $this->assertSame($users, $result);
        $this->assertCount(2, $result);
    }

    public function testGetUserById(): void
    {
        $user = new User();
        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($user);

        $result = $this->userService->getUserById(1);
        $this->assertSame($user, $result);
    }

    public function testGetUserByIdNotFound(): void
    {
        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $result = $this->userService->getUserById(999);
        $this->assertNull($result);
    }

    public function testGetByEmail(): void
    {
        $user = new User();
        $this->userRepository->expects($this->once())
            ->method('findByEmail')
            ->with('test@example.com')
            ->willReturn($user);

        $result = $this->userService->getByEmail('test@example.com');
        $this->assertSame($user, $result);
    }

    public function testCreateUser(): void
    {
        $user = new User();
        $this->passwordHasher->expects($this->once())
            ->method('hashPassword')
            ->with($this->isInstanceOf(User::class), 'plain_password')
            ->willReturn('hashed_password');

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($this->callback(function ($persistedUser) {
                return $persistedUser instanceof User &&
                    $persistedUser->getName() === 'John Doe' &&
                    $persistedUser->getEmail() === 'john.doe@example.com' &&
                    $persistedUser->getPassword() === 'hashed_password' &&
                    $persistedUser->getCreatedAt() instanceof \DateTimeInterface &&
                    $persistedUser->getUpdatedAt() instanceof \DateTimeInterface;
            }));

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->userService->createUser('John Doe', 'john.doe@example.com', 'plain_password');
        $this->assertInstanceOf(User::class, $result);
        $this->assertEquals('John Doe', $result->getName());
        $this->assertEquals('john.doe@example.com', $result->getEmail());
        $this->assertEquals('hashed_password', $result->getPassword());
        $this->assertInstanceOf(\DateTimeInterface::class, $result->getCreatedAt());
        $this->assertInstanceOf(\DateTimeInterface::class, $result->getUpdatedAt());
    }

    public function testUpdateUserSuccess(): void
    {
        $user = new User();
        $user->setName('Old Name');
        $user->setEmail('old@example.com');
        $user->setPassword('old_hashed_password');

        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($user);

        $this->passwordHasher->expects($this->once())
            ->method('hashPassword')
            ->with($this->isInstanceOf(User::class), 'new_password')
            ->willReturn('new_hashed_password');

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->userService->updateUser(1, 'New Name', 'new@example.com', 'new_password');
        $this->assertSame($user, $result);
        $this->assertEquals('New Name', $user->getName());
        $this->assertEquals('new@example.com', $user->getEmail());
        $this->assertEquals('new_hashed_password', $user->getPassword());
        $this->assertInstanceOf(\DateTimeInterface::class, $user->getUpdatedAt());
    }

    public function testUpdateUserPartialUpdate(): void
    {
        $user = new User();
        $user->setName('Old Name');
        $user->setEmail('old@example.com');
        $user->setPassword('old_hashed_password');

        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($user);

        $this->passwordHasher->expects($this->never())
            ->method('hashPassword');

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->userService->updateUser(1, 'New Name', null, null);
        $this->assertSame($user, $result);
        $this->assertEquals('New Name', $user->getName());
        $this->assertEquals('old@example.com', $user->getEmail()); // Pas de changement
        $this->assertEquals('old_hashed_password', $user->getPassword()); // Pas de changement
        $this->assertInstanceOf(\DateTimeInterface::class, $user->getUpdatedAt());
    }

    public function testUpdateUserNotFound(): void
    {
        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->passwordHasher->expects($this->never())
            ->method('hashPassword');

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->userService->updateUser(999, 'New Name', 'new@example.com', 'new_password');
        $this->assertNull($result);
    }

    public function testDeleteUserSuccess(): void
    {
        $user = new User();
        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($user);

        $this->entityManager->expects($this->once())
            ->method('remove')
            ->with($user);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $result = $this->userService->deleteUser(1);
        $this->assertTrue($result);
    }

    public function testDeleteUserNotFound(): void
    {
        $this->userRepository->expects($this->once())
            ->method('find')
            ->with(999)
            ->willReturn(null);

        $this->entityManager->expects($this->never())
            ->method('remove');

        $this->entityManager->expects($this->never())
            ->method('flush');

        $result = $this->userService->deleteUser(999);
        $this->assertFalse($result);
    }
}