<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181103222141 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE TABLE oauth_access_token (id SERIAL NOT NULL, client_id INT NOT NULL, user_id INT DEFAULT NULL, token VARCHAR(255) NOT NULL, expires_at INT DEFAULT NULL, scope VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F7FA86A45F37A13B ON oauth_access_token (token)');
        $this->addSql('CREATE INDEX IDX_F7FA86A419EB6921 ON oauth_access_token (client_id)');
        $this->addSql('CREATE INDEX IDX_F7FA86A4A76ED395 ON oauth_access_token (user_id)');
        $this->addSql('CREATE TABLE oauth_refresh_token (id SERIAL NOT NULL, client_id INT NOT NULL, user_id INT DEFAULT NULL, token VARCHAR(255) NOT NULL, expires_at INT DEFAULT NULL, scope VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_55DCF7555F37A13B ON oauth_refresh_token (token)');
        $this->addSql('CREATE INDEX IDX_55DCF75519EB6921 ON oauth_refresh_token (client_id)');
        $this->addSql('CREATE INDEX IDX_55DCF755A76ED395 ON oauth_refresh_token (user_id)');
        $this->addSql('CREATE TABLE oauth_client (id SERIAL NOT NULL, random_id VARCHAR(255) NOT NULL, redirect_uris TEXT NOT NULL, secret VARCHAR(255) NOT NULL, allowed_grant_types TEXT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN oauth_client.redirect_uris IS \'(DC2Type:array)\'');
        $this->addSql('COMMENT ON COLUMN oauth_client.allowed_grant_types IS \'(DC2Type:array)\'');
        $this->addSql('CREATE TABLE oauth_auth_code (id SERIAL NOT NULL, client_id INT NOT NULL, user_id INT DEFAULT NULL, token VARCHAR(255) NOT NULL, redirect_uri TEXT NOT NULL, expires_at INT DEFAULT NULL, scope VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_4D12F0E05F37A13B ON oauth_auth_code (token)');
        $this->addSql('CREATE INDEX IDX_4D12F0E019EB6921 ON oauth_auth_code (client_id)');
        $this->addSql('CREATE INDEX IDX_4D12F0E0A76ED395 ON oauth_auth_code (user_id)');
        $this->addSql('ALTER TABLE oauth_access_token ADD CONSTRAINT FK_F7FA86A419EB6921 FOREIGN KEY (client_id) REFERENCES oauth_client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE oauth_access_token ADD CONSTRAINT FK_F7FA86A4A76ED395 FOREIGN KEY (user_id) REFERENCES api_user (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE oauth_refresh_token ADD CONSTRAINT FK_55DCF75519EB6921 FOREIGN KEY (client_id) REFERENCES oauth_client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE oauth_refresh_token ADD CONSTRAINT FK_55DCF755A76ED395 FOREIGN KEY (user_id) REFERENCES api_user (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE oauth_auth_code ADD CONSTRAINT FK_4D12F0E019EB6921 FOREIGN KEY (client_id) REFERENCES oauth_client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE oauth_auth_code ADD CONSTRAINT FK_4D12F0E0A76ED395 FOREIGN KEY (user_id) REFERENCES api_user (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('ALTER TABLE oauth_access_token DROP CONSTRAINT FK_F7FA86A419EB6921');
        $this->addSql('ALTER TABLE oauth_refresh_token DROP CONSTRAINT FK_55DCF75519EB6921');
        $this->addSql('ALTER TABLE oauth_auth_code DROP CONSTRAINT FK_4D12F0E019EB6921');
        $this->addSql('DROP TABLE oauth_access_token');
        $this->addSql('DROP TABLE oauth_refresh_token');
        $this->addSql('DROP TABLE oauth_client');
        $this->addSql('DROP TABLE oauth_auth_code');
    }
}
