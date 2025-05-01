<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250405005635 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE tickets (id INT AUTO_INCREMENT NOT NULL, titre VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE sale_ticket (ticket_id INT NOT NULL, sale_id INT NOT NULL, INDEX IDX_E3C1A361700047D2 (ticket_id), INDEX IDX_E3C1A3614A7E4868 (sale_id), PRIMARY KEY(ticket_id, sale_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE sale_ticket ADD CONSTRAINT FK_E3C1A361700047D2 FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE sale_ticket ADD CONSTRAINT FK_E3C1A3614A7E4868 FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE sale_ticket DROP FOREIGN KEY FK_E3C1A361700047D2
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE sale_ticket DROP FOREIGN KEY FK_E3C1A3614A7E4868
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE tickets
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE sale_ticket
        SQL);
    }
}
