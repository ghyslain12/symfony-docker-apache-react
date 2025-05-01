<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250404231159 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE sales (id INT AUTO_INCREMENT NOT NULL, customer_id INT NOT NULL, titre VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_6B8170449395C3F3 (customer_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE material_sale (sale_id INT NOT NULL, material_id INT NOT NULL, INDEX IDX_B123AD304A7E4868 (sale_id), INDEX IDX_B123AD30E308AC6F (material_id), PRIMARY KEY(sale_id, material_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE sales ADD CONSTRAINT FK_6B8170449395C3F3 FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE material_sale ADD CONSTRAINT FK_B123AD304A7E4868 FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE material_sale ADD CONSTRAINT FK_B123AD30E308AC6F FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE sales DROP FOREIGN KEY FK_6B8170449395C3F3
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE material_sale DROP FOREIGN KEY FK_B123AD304A7E4868
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE material_sale DROP FOREIGN KEY FK_B123AD30E308AC6F
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE sales
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE material_sale
        SQL);
    }
}
