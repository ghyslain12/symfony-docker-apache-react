<?php

namespace App\Tests\Repository;

use App\Entity\Customer;
use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class UserRepositoryTest extends KernelTestCase
{
    private UserRepository $userRepository;
    private $entityManager;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->entityManager = $kernel->getContainer()->get('doctrine')->getManager();
        $this->userRepository = $this->entityManager->getRepository(User::class);

        // Nettoyer la base
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();
    }

    public function testFindByEmail(): void
    {
        $user = new User();
        $user->setName('test');
        $user->setPassword('test');
        $user->setEmail('test@test.com');
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $foundUser = $this->userRepository->findByEmail('test@test.com');
        $this->assertNotNull($foundUser);
        $this->assertEquals('test@test.com', $foundUser->getEmail());

        $notFoundUser = $this->userRepository->findByEmail('Non Existent');
        $this->assertNull($notFoundUser);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
        $this->entityManager = null;
    }
}