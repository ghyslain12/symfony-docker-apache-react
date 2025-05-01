
-- --------------------------------------------------------
--
-- Base de donnees `app`
--
-- --------------------------------------------------------


-- Création de l'utilisateur et attribution des privilèges
GRANT ALL PRIVILEGES ON app.* TO 'gigi'@'%';
FLUSH PRIVILEGES;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Base de données : `app`
--

-- --------------------------------------------------------

--
-- Structure de la table `customers`
--

CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `surnom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `customers`
--

INSERT IGNORE INTO `customers` (`id`, `user_id`, `surnom`, `created_at`, `updated_at`) VALUES
(1, 2, 'client 1', '2025-04-04 22:30:08', '2025-04-04 22:30:08'),
(3, 2, 'client 2', '2025-04-04 22:48:35', '2025-04-04 22:48:35'),
(4, 2, 'client 3', '2025-04-04 22:50:03', '2025-04-04 22:50:03'),
(5, 2, 'client 4', '2025-04-04 22:50:29', '2025-04-04 22:50:29'),
(6, 2, 'client 5', '2025-04-04 22:52:39', '2025-04-04 22:52:39'),
(7, 2, 'client 6', '2025-04-05 02:41:37', '2025-04-05 02:42:32');

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

CREATE TABLE IF NOT EXISTS `doctrine_migration_versions` (
  `version` varchar(191) COLLATE utf8mb3_unicode_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT IGNORE INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20250404183554', '2025-04-04 18:36:04', 221),
('DoctrineMigrations\\Version20250404211927', '2025-04-04 21:21:26', 161),
('DoctrineMigrations\\Version20250404221954', '2025-04-04 22:20:21', 362),
('DoctrineMigrations\\Version20250404231159', '2025-04-04 23:12:11', 911),
('DoctrineMigrations\\Version20250405005635', '2025-04-05 00:56:54', 839);

-- --------------------------------------------------------

--
-- Structure de la table `materials`
--

CREATE TABLE IF NOT EXISTS `materials` (
  `id` int NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `materials`
--

INSERT IGNORE INTO `materials` (`id`, `designation`, `created_at`, `updated_at`) VALUES
(1, 'modem 2', '2025-04-04 21:50:10', '2025-04-04 21:50:10'),
(2, 'stb', '2025-04-04 21:50:26', '2025-04-04 21:50:26');

-- --------------------------------------------------------

--
-- Structure de la table `material_sale`
--

CREATE TABLE IF NOT EXISTS `material_sale` (
  `sale_id` int NOT NULL,
  `material_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `material_sale`
--

INSERT IGNORE INTO `material_sale` (`sale_id`, `material_id`) VALUES
(1, 1),
(4, 1),
(4, 2),
(6, 1),
(6, 2),
(7, 1),
(7, 2),
(8, 1),
(8, 2);

-- --------------------------------------------------------

--
-- Structure de la table `sales`
--

CREATE TABLE IF NOT EXISTS `sales` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sales`
--

INSERT IGNORE INTO `sales` (`id`, `customer_id`, `titre`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'sale44', 'desc4', '2025-04-04 23:48:24', '2025-04-05 00:29:00'),
(2, 1, 'sale2', 'desc2', '2025-04-04 23:49:25', '2025-04-04 23:49:25'),
(3, 1, 'sale3', 'desc3', '2025-04-05 00:04:43', '2025-04-05 00:04:43'),
(4, 1, 'sale88', 'desc8', '2025-04-05 00:11:42', '2025-04-05 02:37:02'),
(6, 1, 'sale6', 'desc6', '2025-04-05 02:32:33', '2025-04-05 02:32:33'),
(7, 1, 'sale7', 'desc7', '2025-04-05 02:33:19', '2025-04-05 02:33:19'),
(8, 1, 'sale8', 'desc8', '2025-04-05 02:35:39', '2025-04-05 02:35:39');

-- --------------------------------------------------------

--
-- Structure de la table `sale_ticket`
--

CREATE TABLE IF NOT EXISTS `sale_ticket` (
  `ticket_id` int NOT NULL,
  `sale_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sale_ticket`
--

INSERT IGNORE INTO `sale_ticket` (`ticket_id`, `sale_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1);

-- --------------------------------------------------------

--
-- Structure de la table `tickets`
--

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `tickets`
--

INSERT IGNORE INTO `tickets` (`id`, `titre`, `description`, `created_at`, `updated_at`) VALUES
(1, 'ticket1', 'desc1', '2025-04-05 00:57:31', '2025-04-05 01:52:29'),
(2, 'ticket2', 'desc2', '2025-04-05 00:59:40', '2025-04-05 00:59:40'),
(3, 'ticket3', 'desc3', '2025-04-05 01:27:23', '2025-04-05 01:27:23'),
(4, 'ticket4', 'desc4', '2025-04-05 01:37:53', '2025-04-05 01:37:53');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(2, 'utilisateur 1', 'g2@g2.com', '$2y$13$MmJwyF4mw4Gn/rJ.rETY7etm8sX0BKUeJuxB7LLd./5WZcTCIQKJy', '2025-04-04 19:36:48', '2025-04-04 19:36:48'),
(4, 'utilisateur 2', 'g3@g3.com', '$2y$13$6Xw2tXc6PleX.DRR4dRPYep4FKgTQ9NWRY0t4CGBXPctguBIEre.W', '2025-04-04 19:45:15', '2025-04-04 19:45:15'),
(7, 'gigi3', 'gigi3@gigi.com', '$2y$13$dp4PBxISvGzlMWUkspHTCOV/8pb62R/rmTojowjOfAtMZd3xKtFn.', NULL, NULL),
(8, 'gigi', 'gigi@gigi.com', '$2y$13$JqCKIW2T30tnNN51DSOIe.Uf0QTdUsVs2XD169767Vq2eR.1puYjC', '2025-04-05 04:18:40', '2025-04-05 04:18:40'),
(9, 'test', 'test@test.com', '$2y$13$K8iP5SiOnDfjiIlRbZjr2.cs5CSvtfvOFr2rtqWLBGyOtAMhguQjS', NULL, NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_62534E21A76ED395` (`user_id`);

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Index pour la table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `material_sale`
--
ALTER TABLE `material_sale`
  ADD PRIMARY KEY (`sale_id`,`material_id`),
  ADD KEY `IDX_B123AD304A7E4868` (`sale_id`),
  ADD KEY `IDX_B123AD30E308AC6F` (`material_id`);

--
-- Index pour la table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_6B8170449395C3F3` (`customer_id`);

--
-- Index pour la table `sale_ticket`
--
ALTER TABLE `sale_ticket`
  ADD PRIMARY KEY (`ticket_id`,`sale_id`),
  ADD KEY `IDX_E3C1A361700047D2` (`ticket_id`),
  ADD KEY `IDX_E3C1A3614A7E4868` (`sale_id`);

--
-- Index pour la table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_1483A5E9E7927C74` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `FK_62534E21A76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `material_sale`
--
ALTER TABLE `material_sale`
  ADD CONSTRAINT `FK_B123AD304A7E4868` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_B123AD30E308AC6F` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `FK_6B8170449395C3F3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sale_ticket`
--
ALTER TABLE `sale_ticket`
  ADD CONSTRAINT `FK_E3C1A3614A7E4868` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_E3C1A361700047D2` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE;
COMMIT;




-- --------------------------------------------------------
--
-- Base de donnees `app_test`
--
-- --------------------------------------------------------








-- Création de la base de données de test
CREATE DATABASE IF NOT EXISTS `app_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Création de l'utilisateur et attribution des privilèges
GRANT ALL PRIVILEGES ON app_test.* TO 'gigi'@'%';
FLUSH PRIVILEGES;

USE app_test;


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Base de données : `app`
--

-- --------------------------------------------------------

--
-- Structure de la table `customers`
--

CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `surnom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `customers`
--

INSERT IGNORE INTO `customers` (`id`, `user_id`, `surnom`, `created_at`, `updated_at`) VALUES
(1, 2, 'ijij', '2025-04-04 22:30:08', '2025-04-04 22:30:08'),
(3, 2, 'ijij3', '2025-04-04 22:48:35', '2025-04-04 22:48:35'),
(4, 2, 'ijij4', '2025-04-04 22:50:03', '2025-04-04 22:50:03'),
(5, 2, 'ijij5', '2025-04-04 22:50:29', '2025-04-04 22:50:29'),
(6, 2, 'ijij6', '2025-04-04 22:52:39', '2025-04-04 22:52:39'),
(7, 2, 'ijij77', '2025-04-05 02:41:37', '2025-04-05 02:42:32');

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

CREATE TABLE IF NOT EXISTS `doctrine_migration_versions` (
  `version` varchar(191) COLLATE utf8mb3_unicode_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT IGNORE INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20250404183554', '2025-04-04 18:36:04', 221),
('DoctrineMigrations\\Version20250404211927', '2025-04-04 21:21:26', 161),
('DoctrineMigrations\\Version20250404221954', '2025-04-04 22:20:21', 362),
('DoctrineMigrations\\Version20250404231159', '2025-04-04 23:12:11', 911),
('DoctrineMigrations\\Version20250405005635', '2025-04-05 00:56:54', 839);

-- --------------------------------------------------------

--
-- Structure de la table `materials`
--

CREATE TABLE IF NOT EXISTS `materials` (
  `id` int NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `materials`
--

INSERT IGNORE INTO `materials` (`id`, `designation`, `created_at`, `updated_at`) VALUES
(1, 'modem 2', '2025-04-04 21:50:10', '2025-04-04 21:50:10'),
(2, 'stb', '2025-04-04 21:50:26', '2025-04-04 21:50:26');

-- --------------------------------------------------------

--
-- Structure de la table `material_sale`
--

CREATE TABLE IF NOT EXISTS `material_sale` (
  `sale_id` int NOT NULL,
  `material_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `material_sale`
--

INSERT IGNORE INTO `material_sale` (`sale_id`, `material_id`) VALUES
(1, 1),
(4, 1),
(4, 2),
(6, 1),
(6, 2),
(7, 1),
(7, 2),
(8, 1),
(8, 2);

-- --------------------------------------------------------

--
-- Structure de la table `sales`
--

CREATE TABLE IF NOT EXISTS `sales` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sales`
--

INSERT IGNORE INTO `sales` (`id`, `customer_id`, `titre`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'vente 1', 'description 1', '2025-04-04 23:48:24', '2025-04-05 00:29:00'),
(2, 1, 'vente 2', 'description 2', '2025-04-04 23:49:25', '2025-04-04 23:49:25'),
(3, 1, 'vente 3', 'description 3', '2025-04-05 00:04:43', '2025-04-05 00:04:43'),
(4, 1, 'vente 4', 'description 4', '2025-04-05 00:11:42', '2025-04-05 02:37:02'),
(6, 1, 'vente 5', 'description 5', '2025-04-05 02:32:33', '2025-04-05 02:32:33'),
(7, 1, 'vente 6', 'description 6', '2025-04-05 02:33:19', '2025-04-05 02:33:19'),
(8, 1, 'vente 7', 'description 7', '2025-04-05 02:35:39', '2025-04-05 02:35:39');

-- --------------------------------------------------------

--
-- Structure de la table `sale_ticket`
--

CREATE TABLE IF NOT EXISTS `sale_ticket` (
  `ticket_id` int NOT NULL,
  `sale_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sale_ticket`
--

INSERT IGNORE INTO `sale_ticket` (`ticket_id`, `sale_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1);

-- --------------------------------------------------------

--
-- Structure de la table `tickets`
--

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `tickets`
--

INSERT IGNORE INTO `tickets` (`id`, `titre`, `description`, `created_at`, `updated_at`) VALUES
(1, 'ticket 1', 'description 1', '2025-04-05 00:57:31', '2025-04-05 01:52:29'),
(2, 'ticket 2', 'description 2', '2025-04-05 00:59:40', '2025-04-05 00:59:40'),
(3, 'ticket 3', 'description 3', '2025-04-05 01:27:23', '2025-04-05 01:27:23'),
(4, 'ticket 4', 'description 4', '2025-04-05 01:37:53', '2025-04-05 01:37:53');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(2, 'g2', 'g2@g2.com', '$2y$13$MmJwyF4mw4Gn/rJ.rETY7etm8sX0BKUeJuxB7LLd./5WZcTCIQKJy', '2025-04-04 19:36:48', '2025-04-04 19:36:48'),
(4, '3', 'g3@g3.com', '$2y$13$6Xw2tXc6PleX.DRR4dRPYep4FKgTQ9NWRY0t4CGBXPctguBIEre.W', '2025-04-04 19:45:15', '2025-04-04 19:45:15'),
(7, 'gigi3', 'gigi3@gigi.com', '$2y$13$dp4PBxISvGzlMWUkspHTCOV/8pb62R/rmTojowjOfAtMZd3xKtFn.', NULL, NULL),
(8, 'gigi', 'gigi@gigi.com', '$2y$13$JqCKIW2T30tnNN51DSOIe.Uf0QTdUsVs2XD169767Vq2eR.1puYjC', '2025-04-05 04:18:40', '2025-04-05 04:18:40');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_62534E21A76ED395` (`user_id`);

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Index pour la table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `material_sale`
--
ALTER TABLE `material_sale`
  ADD PRIMARY KEY (`sale_id`,`material_id`),
  ADD KEY `IDX_B123AD304A7E4868` (`sale_id`),
  ADD KEY `IDX_B123AD30E308AC6F` (`material_id`);

--
-- Index pour la table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_6B8170449395C3F3` (`customer_id`);

--
-- Index pour la table `sale_ticket`
--
ALTER TABLE `sale_ticket`
  ADD PRIMARY KEY (`ticket_id`,`sale_id`),
  ADD KEY `IDX_E3C1A361700047D2` (`ticket_id`),
  ADD KEY `IDX_E3C1A3614A7E4868` (`sale_id`);

--
-- Index pour la table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_1483A5E9E7927C74` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `FK_62534E21A76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `material_sale`
--
ALTER TABLE `material_sale`
  ADD CONSTRAINT `FK_B123AD304A7E4868` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_B123AD30E308AC6F` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `FK_6B8170449395C3F3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sale_ticket`
--
ALTER TABLE `sale_ticket`
  ADD CONSTRAINT `FK_E3C1A3614A7E4868` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_E3C1A361700047D2` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE;
COMMIT;